/*
 * oSPARC - The SIMCORE frontend - https://osparc.io
 * Copyright: 2022 IT'IS Foundation - https://itis.swiss
 * License: MIT - https://opensource.org/licenses/MIT
 * Author: Ignacio Pascual (ignapas)
 */

qx.Class.define("osparc.desktop.FormSandboxPage", {
  extend: qx.ui.container.Composite,
  construct: function() {
    this.base()
    this.__buildLayout()
    this.__attachEventHandlers()
    osparc.utils.Utils.fetchJSON("/resource/form/service.json")
      .then(schema => {
        const stringData = JSON.stringify(schema, null, 4)
        this.__schema.setValue(stringData)
        this.__form.addListener("ajvReady", () => {
          this.__form.setSchema(schema)
        })
      })
    osparc.utils.Utils.fetchJSON("/resource/form/service-data.json")
      .then(data => {
        const stringData = JSON.stringify(data, null, 4)
        this.__data.setValue(stringData)
        this.__form.addListenerOnce("ready", () => {
          this.__form.setData(data)
        })
      });
  },
  members: {
    __schema: null,
    __data: null,
    __buildLayout: function() {
      this.setPadding(100)
      this.setLayout(new qx.ui.layout.HBox(50))
      const schemaAndData = new qx.ui.container.Composite()
      schemaAndData.setLayout(new qx.ui.layout.VBox(20))
      this.__schema = new qx.ui.form.TextArea()
      this.__data = new qx.ui.form.TextArea()
      schemaAndData.add(this.__schema, { height: "50%" })
      schemaAndData.add(this.__data, { height: "50%" })
      this.add(schemaAndData, { width: "50%" })
      this.__form = new osparc.component.form.json.JsonSchemaForm()
      const scrollContainer = new qx.ui.container.Scroll()
      scrollContainer.add(this.__form)
      this.add(scrollContainer, { width: "50%" })
    },
    __attachEventHandlers: function() {
      this.__schema.addListener("input", data => {
        try {
          const jsonData = JSON.parse(data.getData())
          this.__form.setSchema(jsonData)
        }
        catch (e) {
          this.__form.setSchema(null)
        }
      })
      this.__data.addListener("input", data => {
        try {
          const jsonData = JSON.parse(data.getData())
          this.__form.setData(jsonData)
        }
        catch (e) {
          this.__form.setData(null)
        }
      })
      this.__form.addListener("submit", data => {
        const stringData = JSON.stringify(data.getData().json, null, 4)
        this.__data.setValue(stringData)
      })
    }
  }
})
