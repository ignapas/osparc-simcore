/*
 * oSPARC - The SIMCORE frontend - https://osparc.io
 * Copyright: 2019 IT'IS Foundation - https://itis.swiss
 * License: MIT - https://opensource.org/licenses/MIT
 * Authors: Ignacio Pascual (ignapas)
 */

qx.Class.define("qxapp.component.service.manager.ActivityManager", {
  extend: qx.ui.core.Widget,

  construct: function() {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.VBox());

    this.__createFiltersBar();
    this.__createActivityTree();
    this.__createActionsBar();

    this.__updateTree();
  },

  members: {
    __tree: null,
    __createFiltersBar: function() {
      const toolbar = new qx.ui.toolbar.ToolBar().set({
        minHeight: 35
      });
      const filtersPart = new qx.ui.toolbar.Part();
      toolbar.add(filtersPart);
  
      const filtersContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());
      const nameFilter = new qxapp.component.filter.TextFilter("name", "activityMonitor");
      filtersContainer.add(nameFilter);
      filtersPart.add(filtersContainer);
  
      this._add(toolbar);
      nameFilter.getChildControl("textfield").setPlaceholder("Filter by name");
    },
  
    __createActivityTree: function() {
      const tree = this.__tree = new qx.ui.treevirtual.TreeVirtual([
        "Name",
        "Service",
        "Status",
        "CPU usage",
        "GPU usage"
      ]).set({
        decorator: "no-border",
        padding: 0
      });
      this._add(tree, {
        flex: 1
      });
    },
  
    __createActionsBar: function() {
      const toolbar = new qx.ui.toolbar.ToolBar();
      const actionsPart = new qx.ui.toolbar.Part();
      toolbar.addSpacer();
      toolbar.add(actionsPart);
  
      const runButton = new qx.ui.toolbar.Button(this.tr("Run"), "@FontAwesome5Solid/play/14");
      actionsPart.add(runButton);
  
      const stopButton = new qx.ui.toolbar.Button(this.tr("Stop"), "@FontAwesome5Solid/stop-circle/14");
      actionsPart.add(stopButton);
  
      const infoButton = new qx.ui.toolbar.Button(this.tr("Info"), "@FontAwesome5Solid/info/14");
      actionsPart.add(infoButton);
  
      this._add(toolbar);
    },

    __updateTree: function() {
      const call = qxapp.io.rest.ResourceFactory.getInstance().createStudyResources().projects;
      call.addListenerOnce("getSuccess", e => {
        const studies = e.getRequest().getResponse().data;
        const model = this.__tree.getDataModel();
        studies.forEach(study => {
          let parent = null;
          for (let key in study.workbench) {
            const node = study.workbench[key];
            const metadata = qxapp.store.Store.getInstance().getNodeMetaData(node.key, node.version);
            if (metadata && metadata.type === "computational") {
              if (parent === null) {
                parent = model.addBranch(null, study.name, true);
              }
              model.addLeaf(parent, node.label);
            }
          }
        });
        model.setData();
      });
      call.addListenerOnce("getError", e => {
        console.error(e);
      });
      call.get();
    }
  }
});
