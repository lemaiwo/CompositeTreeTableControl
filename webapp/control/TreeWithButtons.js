sap.ui.define(['sap/ui/core/XMLComposite'], function (XMLComposite) {
	"use strict";
	var TreeWithButtons = XMLComposite.extend("be.wl.CompositeControlExample.control.TreeWithButtons", {
		metadata: {
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
						aggregation: "rows"
					}
				}
			}
		},
		onCollapseAll: function () {
			var oTreeTable = this.byId("innerTreeTable");
			oTreeTable.collapseAll();
		},

		onCollapseSelection: function () {
			var oTreeTable = this.byId("innerTreeTable");
			oTreeTable.collapse(oTreeTable.getSelectedIndices());
		},

		onExpandFirstLevel: function () {
			var oTreeTable = this.byId("innerTreeTable");
			oTreeTable.expandToLevel(1);
		},

		onExpandSelection: function () {
			var oTreeTable = this.byId("innerTreeTable");
			oTreeTable.expand(oTreeTable.getSelectedIndices());
		}
	});
	return TreeWithButtons;
});