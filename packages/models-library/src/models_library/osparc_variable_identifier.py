from copy import deepcopy
from typing import Any, TypeVar

from pydantic import BaseModel, Field
from pydantic.errors import PydanticErrorMixin

from .utils.string_substitution import OSPARC_IDENTIFIER_PREFIX

T = TypeVar("T")


class OsparcVariableIdentifier(BaseModel):
    # NOTE: To allow parametrized value, set the type to Union[OsparcVariableIdentifier, ...]
    # NOTE: When dealing with str types, to avoid unexpected behavior, the following
    # order is suggested `OsparcVariableIdentifier | str`
    __root__: str = Field(
        ..., regex=rf"^\${{?{OSPARC_IDENTIFIER_PREFIX}[A-Za-z0-9_]+}}?(:-.+)?$"
    )

    def _get_without_template_markers(self) -> str:
        # $VAR
        # ${VAR}
        # ${VAR:-}
        # ${VAR:-default}
        # ${VAR:-{}}
        if self.__root__.startswith("${"):
            return self.__root__.removeprefix("${").removesuffix("}")
        return self.__root__.removeprefix("$")

    @property
    def name(self) -> str:
        return self._get_without_template_markers().split(":-")[0]

    @property
    def default_value(self) -> str | None:
        parts = self._get_without_template_markers().split(":-")
        return parts[1] if len(parts) > 1 else None


class UnresolvedOsparcVariableIdentifierError(PydanticErrorMixin, TypeError):
    msg_template = "Provided argument is unresolved: value={value}"


def raise_if_unresolved(var: OsparcVariableIdentifier | T) -> T:
    """Raise error or return original value

    Use like below to make linters play nice.
    ```
    def example_func(par: OsparcVariableIdentifier | int) -> None:
        _ = 12 + check_if_unresolved(par)
    ```

    Raises:
        TypeError: if the the OsparcVariableIdentifier was unresolved
    """
    if isinstance(var, OsparcVariableIdentifier):
        raise UnresolvedOsparcVariableIdentifierError(value=var)
    return var


def replace_osparc_variable_identifier(  # noqa: C901
    obj: T, osparc_variables: dict[str, Any]
) -> T:
    """Replaces mostly in place an instance of `OsparcVariableIdentifier` with the
    value provided inside `osparc_variables`.

    NOTE: if the provided `obj` is instance of OsparcVariableIdentifier in place
    replacement cannot be done. You need to assign it to the previous handler.

    To be safe, always use like so:
    ```
    to_replace_obj = replace_osparc_variable_identifier(to_replace_obj)

    Or like so:
    ```
    obj.to_replace_attribute =r eplace_osparc_variable_identifier(obj.to_replace_attribute)
    ```
    """

    if isinstance(obj, OsparcVariableIdentifier):
        if obj.name in osparc_variables:
            return deepcopy(osparc_variables[obj.name])  # type: ignore
        if obj.default_value is not None:
            return deepcopy(obj.default_value)  # type: ignore
    elif isinstance(obj, dict):
        for key, value in obj.items():
            obj[key] = replace_osparc_variable_identifier(value, osparc_variables)
    elif isinstance(obj, BaseModel):
        for key, value in obj.__dict__.items():
            obj.__dict__[key] = replace_osparc_variable_identifier(
                value, osparc_variables
            )
    if isinstance(obj, list):
        for i, item in enumerate(obj):
            obj[i] = replace_osparc_variable_identifier(item, osparc_variables)
    elif isinstance(obj, tuple):
        new_tuple = tuple(
            replace_osparc_variable_identifier(item, osparc_variables) for item in obj
        )
        obj = new_tuple  # type: ignore
    elif isinstance(obj, set):
        new_set = {
            replace_osparc_variable_identifier(item, osparc_variables) for item in obj
        }
        obj = new_set  # type: ignore
    return obj
