sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	return Controller.extend("be.wl.CompositeControlExample.controller.App", {
		onInit: function () {
			var oModel = new JSONModel("./model/Clothing.json");
			this.getView().setModel(oModel);
		},
		onAddLine: function (oEvent) {
			var treeModel = this.getView().getModel();
			var path = oEvent.getParameter("selectedPath");
			var rowData = treeModel.getProperty(path) || [];
			rowData.push({});
			treeModel.setProperty(path, rowData);
		},
		onDeleteLine: function (oEvent) {
			var selectedRowContext = oEvent.getParameter("selectedContext");
			if (selectedRowContext) {
				this._removeRow(selectedRowContext);
			}
		},
		_removeRow: function (RemoveRowContext) {
			var treeModel = this.getView().getModel();
			var path = RemoveRowContext.getPath().split("/");
			var lastone = parseInt(path[path.length - 1], 10);
			path.pop();
			path = path.join("/");
			var updateDraggedParentItems = treeModel.getProperty(path).filter(function (item, index) {
				return index !== lastone;
			});
			treeModel.setProperty(path, updateDraggedParentItems);
		},
		onMoveRow: function (oEvent) {
			var aDraggedRowContexts = oEvent.getParameter("draggedRowContexts");
			var draggedRowIndex = oEvent.getParameter("draggedRowIndex");
			var oNewTargetContext = oEvent.getParameter("newTargetContext");
			var treeModel = this.getView().getModel();

			if (aDraggedRowContexts.length === 0 || !oNewTargetContext) {
				return;
			}

			var oNewTarget = oNewTargetContext.getProperty();

			for (var i = 0; i < aDraggedRowContexts.length; i++) {
				if (oNewTargetContext.getPath().indexOf(aDraggedRowContexts[i].getPath()) === 0) {
					// Avoid moving a node into one of its child nodes.
					continue;
				}
				var targetPath = oNewTargetContext.getPath().split("/");
				targetPath.pop();
				targetPath = targetPath.join("/");
				var updateTargetItems = treeModel.getProperty(targetPath).reduce(function (items, item, index) {	
					//add existing line unless it is the dragged row that was already on the same level				
					if (item !== aDraggedRowContexts[i].getProperty()) {
						items.push(item);
					}
					//add dragged row after the place it has been dropped
					if (item === oNewTargetContext.getObject()) {
						items.push(aDraggedRowContexts[i].getProperty());
					}
					return items;
				}, []);

				this._removeRow(aDraggedRowContexts[i]);
				treeModel.setProperty(targetPath, updateTargetItems);
			}
		}
	});
});