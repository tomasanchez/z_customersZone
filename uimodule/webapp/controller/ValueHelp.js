/**
 * Value Help Controller.
 *
 * Methods of Value Help Dialog.
 *
 * @file This files describes Customers View controller.
 * @author Tomas A. Sanchez
 * @since 03.23.2021
 */
/* eslint-disable no-warning-comments */
sap.ui.define(
  [
    "profertil/ctesPorZona/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "../model/formatter",
  ],
  function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    ValueHelpDialog,
    formatter
  ) {
    "use strict";

    // Bind this shortcut
    var oVhController;

    return Controller.extend("profertil.ctesPorZona.controller.ValueHelp", {
      /**
       * Formmater JS split-code.
       * @memberOf profertil.controller.ValueHelp
       */
      formatter: formatter,

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Event handler called when value help is pressed.
       *
       * Opens corresponding mobile or desktop Value Help.
       * @function
       * @public
       * @param {sap.ui.base.Event} oEvent the press event
       */
      onVHPKunnr: function (oEvent) {
        oVhController = this;
        // oInput shortcut
        oVhController._oMultiInput = oEvent.getSource();

        // oValueHelp shortcut
        oVhController._oValueHelpDialog = this._createValueHelp(
          "Clientes",
          "Kunnr",
          "Name1",
          oVhController.onKunnrSelection
        );

        this._setVHDKunnrColumns();

        this._setVHDKunnrFilterBar();

        this.getView().addDependent(oVhController._oValueHelpDialog);
        this._oValueHelpDialog.open();
      },

      /**
       * Triggered when OK button is pressed on VHD.
       *
       * Handles ValueHelp Close.
       * @function
       * @public
       * @param {sap.ui.base.Event} oEvent the press event
       */
      // eslint-disable-next-line no-unused-vars
      onKunnrSelection: function (_oEvent) {
        var oTable = oVhController._oValueHelpDialog.getTable(),
          aItems = oTable.getSelectedItems();

        this._addTokens(oVhController._oMultiInput, aItems);

        oVhController._oValueHelpDialog.close();
      },

      /**
       * Triggered by Change on Bzirk ComboBox.
       *
       * Creates Filters for ValueHelp.
       *
       * @function
       * @public
       * @param {sap.ui.base.Event} oEvent the change event
       */
      onFetchCustomers: function (oEvent) {
        var oComboBox = oEvent.getSource(),
          sBzirk = oComboBox.getSelectedKey();

        // Cancel mandatory highlights as it has been filled
        oComboBox.setValueState("None");

        // The Table Filters
        var aFilters = [];

        aFilters.push(new Filter("Bzirk", FilterOperator.EQ, sBzirk));

        this._fetchCustomers(aFilters);
      },

      /**
       * Triggered by Live Change on ValueHelp Inputs.
       *
       * Filters ValueHelp Table
       *
       * @function
       * @public
       * @param {sap.ui.base.Event} oEvent the live change event
       */
      // eslint-disable-next-line no-unused-vars
      onVhLiveChange: function (oEvent) {
        var aFilters = oVhController._getAllVHFilters();

        var oTable = oVhController._oValueHelpDialog.getTable();

        var oBinding = oTable.getBinding("rows");
        oBinding.filter(aFilters, "Application");
      },

      /* =========================================================== */
      /* Internal Methods                                            */
      /* =========================================================== */
      /**
       * Gets all Live Filters.
       *
       * Gets all input filters.
       * @function
       * @private
       * @return {array} an array of sap.ui.model.Filter
       */
      _getAllVHFilters: function () {
        var aInputs = oVhController._oValueHelpDialog
          .getFilterBar()
          .getFilterGroupItems()
          .map(function (oFGI) {
            return oFGI.getControl();
          })
          .filter(function (oInput) {
            //Requiriment must be an Input and have a control Name of property filter
            return oInput instanceof sap.m.Input && oInput.getName().length > 0;
          });

        var aFilters = [];

        try {
          aInputs.forEach(function (oInput) {
            var sValue = oInput.getValue();

            if (oInput.getName() != "Kunnr") {
              if (sValue.length > 0)
                aFilters.push(
                  new Filter(oInput.getName(), FilterOperator.Contains, sValue)
                );
            } else {
              if (sValue.length > 0) {
                // If any letter Name else number
                var sProperty = /[a-z]/i.test(sValue) ? "Name1" : "Kunnr";

                aFilters.push(
                  new Filter(sProperty, FilterOperator.Contains, sValue)
                );
              }
            }
          });
        } finally {
          return aFilters;
        }
      },

      /**
       * Fetchs Table data.
       *
       * Makes oData Request to ClientesSet.
       *
       * @function
       * @private
       * @param {array} aFilters the filters array
       */
      _fetchCustomers: function (aFilters) {
        var oModel = this.getModel();

        var oValueHelpDialog = oVhController._oValueHelpDialog;

        oValueHelpDialog.getTable().setBusy(true);

        oModel.read("/ClientesSet", {
          filters: aFilters,
          success: function (oData) {
            var oRowsModel = new JSONModel(oData.results);
            oValueHelpDialog.getTable().setModel(oRowsModel);
            // When Mobile bind rows
            if (oValueHelpDialog.getTable().bindRows) {
              oValueHelpDialog.getTable().bindRows("/");
            }

            oValueHelpDialog.setTitle(`Clientes (${oData.results.length})`);

            // When Mobile bind Items
            if (oValueHelpDialog.getTable().bindItems) {
              var oTable = oValueHelpDialog.getTable();

              // eslint-disable-next-line no-unused-vars
              oTable.bindAggregation("items", "/", function (sId, oContext) {
                var aCols = oTable.getModel("columns").getData().cols;

                return new sap.m.ColumnListItem({
                  cells: aCols.map(function (oColumn) {
                    var sColname = oColumn.template;
                    return new sap.m.Label({
                      text: `{${sColname}}`,
                    });
                  }),
                });
              });
            }

            oValueHelpDialog.getTable().setBusy(false);
          },
        });
      },

      /**
       * Add tokens to multi-input.
       *
       * Verifies if not alredy added and adds a token and fires it changes.
       * @function
       * @private
       * @param {sap.m.MultiInput} oMultiInput the input to add tokens
       * @param {array} aItems the context items array
       */
      _addTokens: function (oMultiInput, aItems) {
        var aPreviousTokens = oMultiInput.getTokens();

        aItems.forEach((oItem) => {
          if (
            // Verification if alredy exists
            !aPreviousTokens.some(function (oToken) {
              return oToken.getKey() === oItem.Kunnr;
            })
          ) {
            oMultiInput.addToken(
              new sap.m.Token({
                // Description shown in token
                text: oItem.Name1,
                // Primary key of entity
                key: oItem.Kunnr,
              })
            );
          }
        });

        oMultiInput.fireChange();
      },

      /**
       * Sets Columns for VHD.
       *
       * Custom Columns for Value Help Kunnr Dialog.
       * @function
       * @private
       */
      _setVHDKunnrColumns: function () {
        var oColModel = new JSONModel();

        oColModel.setData({
          cols: [
            {
              label: "Nro de Cliente",
              template: "Kunnr",
              width: "auto",
              hAlign: "Center",
            },
            {
              label: "Cliente",
              template: "Name1",
              width: "auto",
              hAlign: "Center",
            },
          ],
        });

        this._oValueHelpDialog
          .getTableAsync()
          .then((oTable) => oTable.setModel(oColModel, "columns"));
      },

      /**
       * Sets FilterBar for VHD.
       *
       * Custom FilterBar for Value Help Kunnr Dialog.
       * @function
       * @private
       */
      _setVHDKunnrFilterBar: function () {
        // The new Filter Bar
        var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
          advancedMode: true,
          filterBarExpanded: true,
          showFilterConfiguration: false,
          useToolbar: false,
          // The Control Items
          filterGroupItems: [
            // Bzirk Item
            new sap.ui.comp.filterbar.FilterGroupItem({
              groupName: "_group1",
              name: "Bzirk",
              mandatory: true,
              label: oVhController.readFromI18n("bzirkLabel"),
              control: new sap.m.ComboBox({
                id: "bzirkCB",
                change: function (oEvent) {
                  oVhController.onFetchCustomers(oEvent);
                },
                forceSelection: false,
                placeholder: oVhController.readFromI18n("bzirkPH"),
                showSecondaryValues: true,
                valueState: "Warning",
                valueStateText: "Primero seleccione una Zona de Ventas",
                items: {
                  path: "/ZonasSet",
                  template: new sap.ui.core.ListItem({
                    key: "{path: 'Bzirk'}",
                    text: "{path: 'Bztxt'}",
                    additionalText:
                      "{path: 'Bzirk', formatter:'formatter.deleteLeadingZeros'}",
                  }),
                },
              }),
            }),
            // Kunnr Item
            new sap.ui.comp.filterbar.FilterGroupItem({
              groupName: "_group1",
              name: "kunnr",
              mandatory: false,
              label: oVhController.readFromI18n("kunnrLabel"),
              control: new sap.m.Input({
                id: "kunnrIN",
                name: "Kunnr",
                liveChange: oVhController.onVhLiveChange,
                placeholder: oVhController.readFromI18n("kunnrPH"),
                showSecondaryValues: true,
              }),
            }),
          ],
        });

        this._oValueHelpDialog.setFilterBar(oFilterBar);
      },

      /**
       * Creates a new ValueHelp Dialog.
       *
       * Returns a value help corresponding to device system.
       *
       * @function
       * @private
       * @param {string} sTitle the Value Help Title to be displayed
       * @param {string} sKey the Input Key value.
       * @param {string} sDescriptionKey the description text value.
       * @param {Function} onConfirm the confirm function.
       * @param {boolean} bMultiSelect if multiselection is enabled
       * @return {sap.ui.comp.valuehelpdialog.ValueHelpDialog} the value help dialog
       */
      _createValueHelp: function (
        sTitle,
        sKey,
        sDescriptionKey,
        onConfirm,
        bMultiSelect = true
      ) {
        return sap.ui.Device.system.phone
          ? new ValueHelpDialog({
              title: sTitle,
              supportMultiselect: bMultiSelect,
              key: sKey,
              descriptionKey: sDescriptionKey,
              ok: onConfirm,
              // eslint-disable-next-line no-unused-vars
              cancel: function (_oCancelEvent) {
                oVhController._oValueHelpDialog.close();
              },
              afterClose: function () {
                this.destroy();
                oVhController._oValueHelpDialog = null;
              },
              // eslint-disable-next-line no-unused-vars
              selectionChange: function (_oSelecionEvent) {},
            })
          : new ValueHelpDialog({
              title: sTitle,
              supportMultiselect: bMultiSelect,
              key: sKey,
              descriptionKey: sDescriptionKey,
              supportRanges: false,
              supportRangesOnly: false,
              stretch: sap.ui.Device.system.phone,
              ok: onConfirm,
              // eslint-disable-next-line no-unused-vars
              cancel: function (_oCancelEvent) {
                oVhController._oValueHelpDialog.close();
              },
              afterClose: function () {
                this.destroy();
                oVhController._oValueHelpDialog = null;
              },
              // eslint-disable-next-line no-unused-vars
              selectionChange: function (_oSelecionEvent) {},
            });
      },

      /* =========================================================== */
      /* End of Internal Methods                                     */
      /* =========================================================== */
    });
  }
);
