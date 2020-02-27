/*
 * oSPARC - The SIMCORE frontend - https://osparc.io
 * Copyright: 2020 IT'IS Foundation - https://itis.swiss
 * License: MIT - https://opensource.org/licenses/MIT
 * Authors: Ignacio Pascual (ignapas)
 */

/**
 * A Qooxdoo generated form array to be used inside JsonSchemaForm.
 */
qx.Class.define("osparc.component.form.json.JsonSchemaFormHeader", {
  extend: qx.ui.container.Composite,
  construct: function(schema, depth, isArrayItem) {
    this.base(arguments, new qx.ui.layout.HBox().set({
      alignY: "middle"
    }));
    this.__label = new qx.ui.basic.Label().set({
      allowStretchX: true
    });
    if (schema.type === "object" || schema.type === "array") {
      this.__label.setFont(depth === 0 ? "title-18" : depth == 1 ? "title-16" : "title-14");
      this.setMarginBottom(10);
    }
    this.add(this.__label, {
      flex: isArrayItem ? 0 : 1
    });
    if (isArrayItem) {
      const deleteButton = new qx.ui.form.Button(this.tr("Remove")).set({
        appearance: "link-button"
      });
      this.add(deleteButton);
      deleteButton.addListener("execute", () => {
        const container = this.getLayoutParent();
        const parent = container.getLayoutParent();
        parent.remove(container);
      }, this);
    }
    this.bind("key", this.__label, "value", {
      converter: key => {
        return this.__getHeaderText(key, schema, isArrayItem);
      }
    });
  },
  properties: {
    key: {
      event: "changeKey",
      init: ""
    }
  },
  members: {
    __label: null,
    /**
     * Method that returns an appropriate text for a label.
     */
    __getHeaderText: function(key, schema, isArrayItem) {
      let title = schema.title || key;
      if (isArrayItem) {
        title = schema.title ? `${schema.title} ` : "";
        return title + `#${key + 1}`;
      }
      return title;
    },
    /**
     * Method that sets another widget as the buddy of the label.
     */
    setLabelBuddy: function(widget) {
      this.__label.setBuddy(widget);
    }
  }
});
