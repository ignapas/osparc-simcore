# pylint:disable=unused-variable
# pylint:disable=unused-argument
# pylint:disable=redefined-outer-name

from typing import Any, Dict

import pytest
from models_library.projects_nodes_io import SimCoreFileLink


@pytest.fixture()
def minimal_simcore_file_link() -> Dict[str, Any]:
    return dict(
        store=0,
        path="/some/path/to/a/file.ext",
    )


def test_simcore_file_link_default_label(minimal_simcore_file_link: Dict[str, Any]):
    simcore_file_link = SimCoreFileLink(**minimal_simcore_file_link)

    assert simcore_file_link.store == str(minimal_simcore_file_link["store"])
    assert simcore_file_link.path == minimal_simcore_file_link["path"]
    assert simcore_file_link.label == "file.ext"
    assert simcore_file_link.e_tag == None


def test_simcore_file_link_with_label(minimal_simcore_file_link: Dict[str, Any]):
    old_link = minimal_simcore_file_link
    old_link.update({"label": "some new label that is amazing"})
    simcore_file_link = SimCoreFileLink(**old_link)

    assert simcore_file_link.store == str(minimal_simcore_file_link["store"])
    assert simcore_file_link.path == minimal_simcore_file_link["path"]
    assert simcore_file_link.label == "some new label that is amazing"
    assert simcore_file_link.e_tag == None
