/* ************************************************************************

   qxapp - the simcore frontend

   https://osparc.io

   Copyright:
     2018 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

/**
 * Singleton class that is used as entrypoint to the webserver.
 *
 * All data transfer communication goes through the qxapp.store.Store.
 *
 * *Example*
 *
 * Here is a little example of how to use the class.
 *
 * <pre class='javascript'>
 *    const filesStore = qxapp.store.Data.getInstance();
 *    filesStore.addListenerOnce("nodeFiles", e => {
 *      const files = e.getData();
 *      const newChildren = qxapp.data.Converters.fromDSMToVirtualTreeModel(files);
 *      this.__filesToRoot(newChildren);
 *    }, this);
 *    filesStore.getNodeFiles(nodeId);
 * </pre>
 */

qx.Class.define("qxapp.store.Data", {
  extend: qx.core.Object,

  type : "singleton",

  construct: function() {
    this.resetCache();
  },

  events: {
    "myLocations": "qx.event.type.Data",
    "myDatasets": "qx.event.type.Data",
    "myDocuments": "qx.event.type.Data",
    "nodeFiles": "qx.event.type.Data",
    "fileCopied": "qx.event.type.Data",
    "deleteFile": "qx.event.type.Data"
  },

  members: {
    __locationsCached: null,
    __datasetsByLocationCached: null,
    __filesByLocationAndDatasetCached: null,

    resetCache: function() {
      this.__locationsCached = [];
      this.__datasetsByLocationCached = {};
      this.__filesByLocationAndDatasetCached = {};
    },

    getLocationsCached: function() {
      const cache = this.__locationsCached;
      if (cache.length) {
        return cache;
      }
      return null;
    },

    getLocations: function() {
      const cachedData = this.getLocationsCached();
      if (cachedData) {
        this.fireDataEvent("myLocations", cachedData);
        return;
      }
      // Get available storage locations
      qxapp.data.Resources.get("storageLocations")
        .then(locations => {
          // Add it to cache
          this.__locationsCached = locations;
          this.fireDataEvent("myLocations", locations);
        })
        .catch(err => {
          this.fireDataEvent("myLocations", []);
          console.error(err);
        });
    },

    getDatasetsByLocationCached: function(locationId) {
      const cache = this.__datasetsByLocationCached;
      if (locationId in cache && cache[locationId].length) {
        const data = {
          location: locationId,
          datasets: cache[locationId]
        };
        return data;
      }
      return null;
    },

    getDatasetsByLocation: function(locationId) {
      // Get list of datasets
      if (locationId === 1 && !qxapp.data.Permissions.getInstance().canDo("storage.datcore.read")) {
        return;
      }

      const cachedData = this.getDatasetsByLocationCached(locationId);
      if (cachedData) {
        this.fireDataEvent("myDatasets", cachedData);
        return;
      }

      const params = {
        url: {
          locationId
        }
      };
      qxapp.data.Resources.fetch("storageDatasets", "getByLocation", params)
        .then(datasets => {
          const data = {
            location: locationId,
            datasets: []
          };
          if (datasets && datasets.length>0) {
            data.datasets = datasets;
          }
          // Add it to cache
          this.__datasetsByLocationCached[locationId] = data.datasets;
          this.fireDataEvent("myDatasets", data);
        })
        .catch(err => {
          const data = {
            location: locationId,
            datasets: []
          };
          this.fireDataEvent("myDatasets", data);
          console.error(err);
        });
    },

    getFilesByLocationAndDatasetCached: function(locationId, datasetId) {
      const cache = this.__filesByLocationAndDatasetCached;
      if (locationId in cache && datasetId in cache[locationId] && cache[locationId][datasetId].length) {
        const data = {
          location: locationId,
          dataset: datasetId,
          files: cache[locationId][datasetId]
        };
        return data;
      }
      return null;
    },

    getFilesByLocationAndDataset: function(locationId, datasetId) {
      // Get list of file meta data
      if (locationId === 1 && !qxapp.data.Permissions.getInstance().canDo("storage.datcore.read")) {
        return;
      }

      const cachedData = this.getFilesByLocationAndDatasetCached(locationId, datasetId);
      if (cachedData) {
        this.fireDataEvent("myDocuments", cachedData);
        return;
      }

      const params = {
        url: {
          locationId,
          datasetId
        }
      };
      qxapp.data.Resources.fetch("storageFiles", "getByLocationAndDataset", params)
        .then(files => {
          const data = {
            location: locationId,
            dataset: datasetId,
            files: files && files.length>0 ? files : []
          };
          // Add it to cache
          if (!(locationId in this.__filesByLocationAndDatasetCached)) {
            this.__filesByLocationAndDatasetCached[locationId] = {};
          }
          this.__filesByLocationAndDatasetCached[locationId][datasetId] = data.files;
          this.fireDataEvent("myDocuments", data);
        })
        .catch(err => {
          const data = {
            location: locationId,
            dataset: datasetId,
            files: []
          };
          this.fireDataEvent("myDocuments", data);
          console.error(err);
        });
    },

    getNodeFiles: function(nodeId) {
      const params = {
        url: {
          nodeId: encodeURIComponent(nodeId)
        }
      };
      qxapp.data.Resources.fetch("storageFiles", "getByNode", params)
        .then(files => {
          console.log("Node Files", files);
          if (files && files.length>0) {
            this.fireDataEvent("nodeFiles", files);
          }
          this.fireDataEvent("nodeFiles", []);
        })
        .catch(err => {
          this.fireDataEvent("nodeFiles", []);
          console.error(err);
        });
    },

    getPresignedLink: function(download = true, locationId, fileUuid) {
      if (download && !qxapp.data.Permissions.getInstance().canDo("study.node.data.pull", true)) {
        return;
      }
      if (!download && !qxapp.data.Permissions.getInstance().canDo("study.node.data.push", true)) {
        return;
      }

      // GET: Returns download link for requested file
      // POST: Returns upload link or performs copy operation to datcore
      const params = {
        url: {
          locationId,
          fileUuid: encodeURIComponent(fileUuid)
        }
      };
      qxapp.data.Resources.fetch("storageLink", download ? "getOne" : "put", params)
        .then(data => {
          const presignedLinkData = {
            presignedLink: data,
            locationId: locationId,
            fileUuid: fileUuid
          };
          console.log("presignedLink", presignedLinkData);
          this.fireDataEvent("presignedLink", presignedLinkData);
        })
        .catch(err => {
          console.error(err);
        });
    },

    copyFile: function(fromLoc, fileUuid, toLoc, pathId) {
      if (!qxapp.data.Permissions.getInstance().canDo("study.node.data.push", true)) {
        return false;
      }

      // "/v0/locations/1/files/{}?user_id={}&extra_location={}&extra_source={}".format(quote(datcore_uuid, safe=''),
      let fileName = fileUuid.split("/");
      fileName = fileName[fileName.length-1];

      const params = {
        url: {
          toLoc,
          fileName: encodeURIComponent(pathId + "/" + fileName),
          fromLoc,
          fileUuid: encodeURIComponent(fileUuid)
        }
      };
      qxapp.data.Resources.fetch("storageFiles", "put", params)
        .then(files => {
          const data = {
            data: files, // check
            locationId: toLoc,
            fileUuid: pathId + "/" + fileName
          };
          this.fireDataEvent("fileCopied", data);
        })
        .catch(err => {
          console.error(err);
          console.error("Failed copying file", fileUuid, "to", pathId);
          qxapp.component.message.FlashMessenger.getInstance().logAs(this.tr("Failed copying file"), "ERROR");
          this.fireDataEvent("fileCopied", null);
        });

      return true;
    },

    deleteFile: function(locationId, fileUuid) {
      if (!qxapp.data.Permissions.getInstance().canDo("study.node.data.delete", true)) {
        return false;
      }

      // Deletes File
      const params = {
        url: {
          locationId,
          fileUuid: encodeURIComponent(fileUuid)
        }
      };
      qxapp.data.Resources.fetch("storageFiles", "delete", params)
        .then(files => {
          const data = {
            data: files,
            locationId: locationId,
            fileUuid: fileUuid
          };
          this.fireDataEvent("deleteFile", data);
        })
        .catch(err => {
          console.error(err);
          qxapp.component.message.FlashMessenger.getInstance().logAs(this.tr("Failed deleting file"), "ERROR");
          this.fireDataEvent("deleteFile", null);
        });

      return true;
    }
  }
});
