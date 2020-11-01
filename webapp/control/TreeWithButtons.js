sap.ui.define(['sap/ui/core/XMLComposite'], function (XMLComposite) {
	"use strict";
	var TreeWithButtons = XMLComposite.extend("be.wl.CompositeControlExample.control.TreeWithButtons", {
		metadata: {
			properties: {
				rowCount: { type: 'int', defaultValue: 20, visibility: 'hidden' },
				editable: 'boolean'
			},
			aggregations: {
				columns: {
					type: "sap.ui.table.Column",
					multiple: true,
					// the aggregation will be forwarded directly to the corresponding aggregation in the inner table in table.control.xml
					forwarding: {
						idSuffix: "--innerTreeTable",
						aggregation: "columns"
					}
				},
				rows: {
					type: "sap.ui.table.Row",
					multiple: true,
					// the aggregation will be forwarded directly to the corresponding aggregation in the inner table in table.control.xml
					forwarding: {
						idSuffix: "--innerTreeTable",
						aggregation: "rows",
						forwardBinding: true
					}
				}
			},
			events: {
				add: {
					parameters: {
						selectedIndex: { type: 'integer' },
						selectedPath: { type: 'string' },
						selectedContext: { type: 'sap.ui.model.Context' }
					}
				},
				delete: {
					parameters: {
						selectedIndex: { type: 'integer' },
						selectedPath: { type: 'string' },
						selectedContext: { type: 'sap.ui.model.Context' }
					}
				},
				move: {
					parameters: {
						draggedRowContexts: { type: 'sap.ui.model.Context' },
						draggedRowIndex: { type: 'integer' },
						newTargetContext: { type: 'sap.ui.model.Context' }
					}
				}
			}
		},
		init:function(){
		},
		onAfterRendering: function () {
			this.setRowCount(this.calculateRows());
			this.getBinding("rows").attachChange(function(){
				this.setRowCount(this.calculateRows());
			},this);
		},
		updateRows: function (o) {
			var oTreeTable = this.byId("innerTreeTable");
			return oTreeTable.prototype.updateRows.call(oTreeTable, o);

		},
		calculateRows: function () {
			var rows = this.getBinding("rows");
			return this.countRows(rows.getNodes(0).filter(function (node) {
				return node.level === 0;
			}))
		},
		countRows: function (nodes) {
			var oTreeTable = this.byId("innerTreeTable");
			var rows = this.getBinding("rows");

			return nodes.reduce(function (count, node) {
				count += 1;
				if (node.nodeState.expanded) {
					count += this.countRows(node.children);
				}
				return count;
			}.bind(this), 0);
		},
		getRowModel: function () {
			var rowBindingInfo = this.getBindingInfo("rows");
			return this.getModel(rowBindingInfo.model);
		},
		getRowBindingContexts: function () {
			var rowBindingInfo = this.getBindingInfo("rows");
			return this.getRowModel().getProperty(rowBindingInfo.binding.getPath());
		},
		onCollapseAll: function () {
			var oTreeTable = this.byId("innerTreeTable");
			oTreeTable.collapseAll();
			this.updateVisibleRowCount();
		},

		onCollapseSelection: function () {
			var oTreeTable = this.byId("innerTreeTable");
			if (oTreeTable.getSelectedIndex() > -1) {
				oTreeTable.collapse(oTreeTable.getSelectedIndices());
				this.updateVisibleRowCount();
			}
		},

		onExpandFirstLevel: function () {
			var oTreeTable = this.byId("innerTreeTable");
			oTreeTable.expandToLevel(1);

			this.updateVisibleRowCount();
		},

		onExpandSelection: function () {
			var oTreeTable = this.byId("innerTreeTable");
			if (oTreeTable.getSelectedIndex() > -1) {
				oTreeTable.expand(oTreeTable.getSelectedIndices());
				this.updateVisibleRowCount();
			}
		},
		onToggleRow: function (oEvent) {
			this.updateVisibleRowCount();
		},
		getArrayNames: function () {
			var rowBindingInfo = this.getBindingInfo("rows");
			return rowBindingInfo.parameters.arrayNames[0];

		},
		getSelection: function () {
			var selectedIndex = this.byId("innerTreeTable").getSelectedIndex(),
				rowsModel = this.getModel(this.getBindingInfo("rows").model),
				oTreeTable = this.byId("innerTreeTable");
			if (selectedIndex > -1) {
				var selectedRowContext = oTreeTable.getContextByIndex(selectedIndex),
					path = selectedRowContext.getPath() + "/" + this.getArrayNames();
			} else {//add to root in case nothing is selected
				path = this.getBindingInfo("rows").path;
			}
			return {
				selectedIndex: selectedIndex,
				selectedPath: path,
				selectedContext: selectedRowContext
			};
		},
		onAdd: function (oEvent) {
			var oTreeTable = this.byId("innerTreeTable");
			var selection = this.getSelection();
			this.fireAdd(selection);
			oTreeTable.expand((selection.selectedIndex || 0));
			// this.updateVisibleRowCount();
		},
		onDelete: function () {
			this.fireDelete(this.getSelection());
			// this.updateVisibleRowCount();
		},
		onDragStart: function (oEvent) {
			var oTreeTable = this.byId("innerTreeTable");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedRow = oEvent.getParameter("target");
			var iDraggedRowIndex = oDraggedRow.getIndex();
			var aDraggedRowContexts = [];
			var oDraggedRowContext = oTreeTable.getContextByIndex(iDraggedRowIndex);
			aDraggedRowContexts.push(oDraggedRowContext);

			oDragSession.setComplexData("tree", {
				draggedRowContexts: aDraggedRowContexts,
				draggedRowIndex: iDraggedRowIndex
			});
		},

		onDrop: function (oEvent) {
			var oTreeTable = this.byId("innerTreeTable");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDroppedRow = oEvent.getParameter("droppedControl");
			if (!oDragSession.getComplexData("tree")) {
				return;
			}
			var aDraggedRowContexts = oDragSession.getComplexData("tree").draggedRowContexts;
			var draggedRowIndex = oDragSession.getComplexData("tree").draggedRowIndex;
			var oNewTargetContext = oTreeTable.getContextByIndex(oDroppedRow.getIndex());

			this.fireMove({
				draggedRowContexts: aDraggedRowContexts,
				draggedRowIndex: draggedRowIndex,
				newTargetContext: oNewTargetContext
			});

			// this.updateVisibleRowCount();
		},
		updateVisibleRowCount: function () {
			this.setRowCount(this.calculateRows());
		},
		setRowCount: function (count) {
			this.setProperty("rowCount", count);
		}
	});
	return TreeWithButtons;
});