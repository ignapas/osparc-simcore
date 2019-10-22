/*
 * oSPARC - The SIMCORE frontend - https://osparc.io
 * Copyright: 2019 IT'IS Foundation - https://itis.swiss
 * License: MIT - https://opensource.org/licenses/MIT
 * Authors: Ignacio Pascual (ignapas)
 */

qx.Class.define("osparc.ui.table.cellrenderer.Percentage", {
  extend: qx.ui.table.cellrenderer.Html,

  construct: function(color) {
    this.base(arguments, "center");
    this.__color = color;
  },

  members: {
    // overridden
    _getContentHtml: function(cellInfo) {
      if (cellInfo.value == null || cellInfo.value < 0) { // eslint-disable-line no-eq-null
        return "";
      }
      const height = typeof cellInfo.value === "number" ? cellInfo.value : 0;
      return "" +
        `<div style="position: absolute; left: 0; right: 0;">${cellInfo.value}%</div>` +
        `<div style="height: 100%; width: ${height}%; background-color: ${this.__color};"></div>`;
    }
  }
});
