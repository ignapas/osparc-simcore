/* ************************************************************************

   qxapp - the simcore frontend

   https://osparc.io

   Copyright:
     2019 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Ignacio Pascual (ignapas)

************************************************************************ */

/**
 * Big button representing a service.
 */
qx.Class.define("qxapp.component.service.ServiceJumbo", {
  extend: qxapp.ui.form.Jumbo,
  include: qxapp.component.filter.MFilterable,
  implement: qxapp.component.filter.IFilterable,

  /**
   * Constructor
   */
  construct: function(serviceModel, icon, command) {
    this.base(arguments, serviceModel.getName(), serviceModel.getDescription(), icon, command);
    this.__serviceModel = serviceModel;
  },

  members: {
    __serviceModel: null,

    _filter: function() {
      this.exclude();
    },

    _unfilter: function() {
      this.show();
    },

    _shouldApplyFilter: function(data) {
      if (data.text) {
        const label = this.__serviceModel.getName()
          .trim()
          .toLowerCase();
        if (label.indexOf(data.text) === -1) {
          return true;
        }
      }
      if (data.tags && data.tags.length) {
        const category = this.__serviceModel.getCategory() || "";
        const type = this.__serviceModel.getType() || "";
        if (!data.tags.includes(category.trim().toLowerCase()) && !data.tags.includes(type.trim().toLowerCase())) {
          return true;
        }
      }
      return false;
    },

    _shouldReactToFilter: function(data) {
      if (data.text && data.text.length > 1) {
        return true;
      }
      if (data.tags && data.tags.length) {
        return true;
      }
      return false;
    }
  }
});
