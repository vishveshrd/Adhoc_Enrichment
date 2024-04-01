var html =
  "<div class='reltio-btb-button {0}' ui-actions='click'>\n" +
  "   <style>\n" +
  "      .reltio-btb-button {\n" +
  "         background-color: #337ab7;\n" +
  "         border: 1px solid #2e6da4;\n" +
  "         text-align: center;\n" +
  "         border-radius: 4px;\n" +
  "         display: block;\n" +
  "         cursor: pointer;\n" +
  "         color: #ffffff;\n" +
  "         font-family: Arial;\n" +
  "         font-size: 14px;\n" +
  "         height: 32px;\n" +
  "         line-height: 32px;\n" +
  "      }\n" +
  "      .reltio-btb-button-normal {\n" +
  "         background-color: #337ab7;\n" +
  "         border: 1px solid #2e6da4;\n" +
  "      }\n" +
  "      .reltio-btb-button-normal:hover, .reltio-btb-button-normal:focus, .reltio-btb-button-normal:active {\n" +
  "         background-color: #286090;\n" +
  "         border: 1px solid #204d74;\n" +
  "      }\n" +
  "      .reltio-btb-button-disabled {\n" +
  "         cursor: not-allowed;\n" +
  "         opacity: 0.65;\n" +
  "      }\n" +
  "      .reltio-btb-button-fail {\n" +
  "         background-color: #c9302c;\n" +
  "         border: 1px solid #ac2925;\n" +
  "      }\n" +
  "      .reltio-btb-button-success {\n" +
  "         background-color: #449d44;\n" +
  "         border: 1px solid #398439;\n" +
  "      }\n" +
  "      @keyframes reltio-spinner {\n" +
  "          to {transform: rotate(360deg);}\n" +
  "      }\n" +
  "      @-webkit-keyframes reltio-spinner {\n" +
  "          to {-webkit-transform: rotate(360deg);}\n" +
  "      }\n" +
  "      .reltio-spinner {\n" +
  "          min-width: 24px;\n" +
  "          min-height: 24px;\n" +
  "      }\n" +
  "      .reltio-spinner:before {\n" +
  "          content: '';\n" +
  "          position: absolute;\n" +
  "          top: 50%;\n" +
  "          width: 16px;\n" +
  "          height: 16px;\n" +
  "          margin-top: -10px;\n" +
  "          margin-left: -24px;\n" +
  "      }\n" +
  "      .reltio-spinner:not(:required):before {\n" +
  "          content: '';\n" +
  "          border-radius: 50%;\n" +
  "          border: 2px solid transparent;\n" +
  "          border-top-color: #fff;\n" +
  "          border-bottom-color: #fff;\n" +
  "          animation: reltio-spinner .8s ease infinite;\n" +
  "          -webkit-animation: reltio-spinner .8s ease infinite;\n" +
  "      }\n" +
  "   </style>\n" +
  "   {1}\n" +
  "</div>";

UI.setHeight(34);

Promise.all([UI.getApiPath(), UI.getTenant(), UI.getUiConfiguration(), UI.getEntity()]).then(function (values) {
  var apiPath = values[0],
    tenant = values[1],
    config = values[2],
    entity = values[3],
    lastEntityUri = null,
	entityUri = null,
    enabled = isEnabledForEntity(entity, config);

  if (enabled) {
    UI.setEnabled(true);
    UI.setHtml(html.replace("{0}", "reltio-btb-button-normal").replace("{1}", config.label));
  }
  else {
    UI.setEnabled(true);
    UI.setHtml(html.replace("{0}", "reltio-btb-button-disabled").replace("{1}", config.label));
  }
  UI.onEvent(function (eventType, data) {
    if (eventType === "uiAction" && data.type === "click") {
      if (!enabled) {
        return;
      }
      UI.setEnabled(false);
      UI.setHtml(html.replace("{0}", "reltio-btb-button-disabled").replace("{1}", "<span class='reltio-spinner' style='padding-left: 24px;'>" + (config.loading || config.label) + "</span>"));
		UI.log("entityUri-Pre Function call: " + entityUri);
		UI.log("lastEntityUri-Pre Function call: " + lastEntityUri);
      UI.getEntityUri().then(function (entityUri) {
        lastEntityUri = entityUri;
		UI.log("entityUri-Post Function call: " + entityUri);
		UI.log("lastEntityUri-Post Function call: " + lastEntityUri);
        UI.log("apiPath: (UI.getApiPath()) " + apiPath);
        UI.log("config.url (UI.getUiConfiguration()): " + config.url);
        UI.log("entity: (UI.getEntity()) " + entity);        
        UI.log("entityUri: " + entityUri);        
        UI.log("tenantL: " + tenant);
		UI.log("entityUri-Pre Lambda: " + entityUri);
		UI.log("lastEntityUri-Pre Lambda: " + lastEntityUri);

        UI.api(config.url + entityUri, "POST", null, {
          "tenantId": tenant,
          "environmentUrl": apiPath + "/api/"
        }, null, function (data) {
          UI.setEnabled(true);

          var success = data.success === "OK";
          UI.setHtml(html.replace("{0}", success ? "reltio-btb-button-success" : "reltio-btb-button-fail").replace("{1}", config.label));
          var msg = success ? config.success : config.fail;
          msg = msg + " " + (success ? data.message : (data.error ? data.error.developerMessage || data.error.message : data.message || "")) || "";
          UI.log("entityUri-Post Lambda: " + entityUri);
		  UI.log("lastEntityUri-Post Lambda: " + lastEntityUri);
 		  UI.alert(msg).then(function () {
            if (success) {
              UI.getEntityUri().then(function (uri) {
                if (uri === entityUri) {
                  UI.setEntityUri(entityUri);
                }
              });
            }
          });
        });
      });
    }
    // else if (eventType === "updateEntity" && data.uri !== lastEntityUri) {
    //   entity = data;
    //   enabled = isEnabledForEntity(entity, config);
    //   if (enabled) {
    //     UI.setEnabled(true);
    //     UI.setHtml(html.replace("{0}", "reltio-btb-button-normal").replace("{1}", config.label));
    //   }
    //   else {
    //     UI.setEnabled(true);
    //     UI.setHtml(html.replace("{0}", "reltio-btb-button-disabled").replace("{1}", config.label));
    //   }
    // }
  });
});

function isEnabledForEntity(entity, config) {
  return (!config.checkAttributeToEnable || entity && entity.attributes && entity.attributes[config.checkAttributeToEnable])
    && (!config.checkAttributeToDisable
      || !entity
      || !entity.attributes
      || !Array.isArray(entity.attributes[config.checkAttributeToDisable])
      || entity.attributes[config.checkAttributeToDisable].every(function (v) {
        return v.value === false || typeof v.value === "string" && v.value.toLowerCase() === "false";
      }));
}