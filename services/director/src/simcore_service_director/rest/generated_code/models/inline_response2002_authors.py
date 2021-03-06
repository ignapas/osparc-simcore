# coding: utf-8

from datetime import date, datetime

from typing import List, Dict, Type

from .base_model_ import Model
from .. import util


class InlineResponse2002Authors(Model):
    """NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).

    Do not edit the class manually.
    """

    def __init__(self, affiliation: str=None, email: str=None, name: str=None):
        """InlineResponse2002Authors - a model defined in OpenAPI

        :param affiliation: The affiliation of this InlineResponse2002Authors.
        :param email: The email of this InlineResponse2002Authors.
        :param name: The name of this InlineResponse2002Authors.
        """
        self.openapi_types = {
            'affiliation': str,
            'email': str,
            'name': str
        }

        self.attribute_map = {
            'affiliation': 'affiliation',
            'email': 'email',
            'name': 'name'
        }

        self._affiliation = affiliation
        self._email = email
        self._name = name

    @classmethod
    def from_dict(cls, dikt: dict) -> 'InlineResponse2002Authors':
        """Returns the dict as a model

        :param dikt: A dict.
        :return: The inline_response_200_2_authors of this InlineResponse2002Authors.
        """
        return util.deserialize_model(dikt, cls)

    @property
    def affiliation(self):
        """Gets the affiliation of this InlineResponse2002Authors.

        Affiliation of the author

        :return: The affiliation of this InlineResponse2002Authors.
        :rtype: str
        """
        return self._affiliation

    @affiliation.setter
    def affiliation(self, affiliation):
        """Sets the affiliation of this InlineResponse2002Authors.

        Affiliation of the author

        :param affiliation: The affiliation of this InlineResponse2002Authors.
        :type affiliation: str
        """

        self._affiliation = affiliation

    @property
    def email(self):
        """Gets the email of this InlineResponse2002Authors.

        Email address

        :return: The email of this InlineResponse2002Authors.
        :rtype: str
        """
        return self._email

    @email.setter
    def email(self, email):
        """Sets the email of this InlineResponse2002Authors.

        Email address

        :param email: The email of this InlineResponse2002Authors.
        :type email: str
        """
        if email is None:
            raise ValueError("Invalid value for `email`, must not be `None`")

        self._email = email

    @property
    def name(self):
        """Gets the name of this InlineResponse2002Authors.

        Name of the author

        :return: The name of this InlineResponse2002Authors.
        :rtype: str
        """
        return self._name

    @name.setter
    def name(self, name):
        """Sets the name of this InlineResponse2002Authors.

        Name of the author

        :param name: The name of this InlineResponse2002Authors.
        :type name: str
        """
        if name is None:
            raise ValueError("Invalid value for `name`, must not be `None`")

        self._name = name
