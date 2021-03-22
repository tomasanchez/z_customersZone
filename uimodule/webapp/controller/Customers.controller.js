/**
 * Customers Controller.
 *
 * Methods of Customers View.
 *
 * @file This files describes Customers View controller.
 * @author Tomas A. Sanchez
 * @since 03.22.2021
 */
/* eslint-disable no-warning-comments */
sap.ui.define(
  [
    "profertil/ctesPorZona/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
  ],
  function (Controller, JSONModel, formatter) {
    "use strict";

    // Bind this shortcut
    var oController;

    return Controller.extend("profertil.ctesPorZona.controller.Customers", {
      /**
       * Formmater JS split-code.
       * @memberOf profertil.view.Customers
       */
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the remitos controller is instantiated.
       * @memberOf profertil.view.Customers
       */
      onInit: function () {
        oController = this;
        // The view model to be set
        var oViewModel;

        oViewModel = new JSONModel({
          showSelect: true,
          showSearch: false,
        });

        oController.setModel(oViewModel, "customersView");

        // Add the remitos page to the flp routing history
        this.addHistoryEntry(
          {
            title: this.getResourceBundle().getText("appTitle"),
            icon: "sap-icon://table-view",
            intent: "#Clientes-display",
          },
          true
        );
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Triggered by Footer Main action.
       * Enables selection in table and search action.
       * @function
       * @param {sap.ui.base.Event} oEvent the button press event
       * @param {boolean} bActive the active state
       * @public
       */
      onSelectSearch: (_oEvent, bActive = true) => {
        //oController._toggleTableSelection(bActive);
        oController._toggleDownloadButtons(bActive);
      },

      /**
       * Triggered by Footer Main action.
       * Disbles table selection and search state.
       * @function
       * @param {sap.ui.base.Event} oEvent the button press event
       * @public
       */
      // eslint-disable-next-line no-unused-vars
      onCancelSearch: (_oEvent) => {
        oController.onSelectSearch(null, false);
      },

      /* =========================================================== */
      /* Internal Methods                                            */
      /* =========================================================== */

      /**
       * Enables or disable visibility of buttons by changing model property.
       * @function
       * @private
       * @param {boolean} bActive active select mode ?
       */
      _toggleDownloadButtons: (bActive = false) => {
        var oViewModel = oController.getModel("customersView");
        oViewModel.setProperty("/showSearch", bActive);
        oViewModel.setProperty("/showSelect", !bActive);
      },
      /* =========================================================== */
      /* End of Internal Methods                                     */
      /* =========================================================== */
    });
  }
);
