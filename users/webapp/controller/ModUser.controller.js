sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/Core",
    'sap/m/MessagePopover',
    'sap/ui/core/Element',
    'sap/m/MessageItem',
    'sap/ui/core/library',
    'sap/ui/core/message/Message',



], function (Controller, History, MessageBox, Core, MessagePopover, Element, MessageItem, coreLibrary, Message) {


    function _onObjectMatched(oEvent) {

        //http://s4hana.sytes.net:9222/sap/opu/odata/sap/ZDATOSUSUARIOS_CONSULFF_SRV/UserBapiSet('CONSULFF')
        //oEvent.getParameter("arguments").Username 

        this.getView().bindElement({
            path: "/UserBapiSet('CONSULFF')",
            model: "DatosUser",
            events: {
                dataReceived: function (oData) {
                    _readUser.bind(this)(oData.getParameter("data").Username);
                }.bind(this)
            }
        });

        const objContext = this.getView().getModel("DatosUser").getContext("/UserBapiSet('CONSULFF')").getObject();
        if (objContext) {
            _readUser.bind(this)(objContext.Username);
        }

    };

    function _readUser(Username) {
        this.getView().getModel("DatosUser").read("/UserBapiSet('CONSULFF')", {
            success: function (data) {

            }.bind(this),
            error: function (data) {
                MessageBox.error(oResourceBundle.getText(data));
            }
        });
    }

    var MessageType = coreLibrary.MessageType;
    var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
    return Controller.extend("ns.users.controller.ModUser", {

        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("ModUser").attachPatternMatched(_onObjectMatched, this);

            this._MessageManager = Core.getMessageManager(); 
            this._MessageManager.removeAllMessages();
            this._MessageManager.registerObject(this.getView(), true );
            this.oView.setModel(this._MessageManager.getMessageModel(), "message");
            this.createMessagePopover();
        },

        handleRequiredField: function (oInput) {

            // El contexto donde esta el objeto con el +  se concadena
             var sTarget = oInput.mBindingInfos.value.parts[0].path; 
             this.removeMessageFromTarget(sTarget);

            if (!oInput.getValue()) {
                this._MessageManager.addMessages(
                    new Message({
                        message: "El campo es obligatorio",
                        type: MessageType.Error,
                       // additionalText: oInput.getLabels()[0].getText(),
                         target:sTarget,
                        processor: oMessageProcessor
                    })
                );
            }
        },
        checkInputConstraints: function (group, oInput) {
            var sTarget = oInput.mBindingInfos.value.parts[0].path;
            var _value = oInput.getValue();
            var oBinding = oInput.getBinding("value")

            this.removeMessageFromTarget(sTarget)

            switch (group) {
                case "GR1":
                   /* message = "Invalid email";
                    type = MessageType.Error;
                    description = "El campo mail contiene error";
                    sValueState = "Error";
                    
                    var Constraints = oBinding.getType().getConstraints().search;
                    
                    if (!_value.match(Constraints)) {
                   
                        this._MessageManager.addMessages(
                            new Message({
                                message: message,
                                type: type,
                                additionalText: "", 
                                description: description,
                                target: sTarget,
                                processor: oMessageProcessor
                            })
                        );
                        oInput.setValueState(sValueState);
                    }
                    break;*/
                case "GR2":





                    message = "El Telefono tiene un formato invalido";
                    type = MessageType.Warning;
                    description = "Por favor ingrese un formato valido";
                    sValueState = "Warning";

                    var rexTel = /^\(?(\d{3})\)?[-]?(\d{3})[-]?(\d{4})$/;

                    if (!_value.match(rexTel )) {
                   
                        this._MessageManager.addMessages(
                            new Message({
                                message: message,
                                type: type,
                                additionalText: "", 
                                description: description,
                                target: sTarget,
                                processor: oMessageProcessor
                            })
                        );
                        oInput.setValueState(sValueState);
                    }





                    
                    break;
                default:
                    break;
            }
        
        },
/*
        onChange: function (oEvent) {
            var oInput = oEvent.getSource();
            if (oInput.getRequired()) {
                this.handleRequiredField(oInput);
            }
            if (oInput.getLabels()[0].getText() === "Mail") {
                this.checkInputConstraints('GR1', oInput);
            }else if (oInput.getLabels()[0].getText() === "Telefono") {
                this.checkInputConstraints('GR2', oInput);
            }
        },*/


        removeMessageFromTarget: function (sTarget) {
            // forEach pasa el object message en cada iteraccion 
            this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
                if (oMessage.target === sTarget) {
                    this._MessageManager.removeMessages(oMessage);
                }
                // Es importante este bind ya que con esto le indicamos donde se ejecuta
            }.bind(this));
        },

        onChange: function () {
            // clear potential server-side messages to allow saving the item again
            this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
           
            if (oMessage.code) {
                this._MessageManager.removeMessages(oMessage);
            }
            }.bind(this));
            },
            

        createMessagePopover: function () {
            let that = this;
            this.oMP = new MessagePopover({
                activeTitlePress: function (oEvent) {
                    let oItem = oEvent.getParameter("item");
                    let oPage = that.getView().byId("UserPage");
                    // El objeto con los datos 
                    let oMessage = oItem.getBindingContext("message").getObject();
                    // Registro en el elemento donde tengo un error 
                    let oControl = Element.registry.get(oMessage.getControlId());
                    // si el controlador esta instanciado
                    if (oControl) {
                        //navego al elemento 
                        oPage.scrollToElement(oControl.getDomRef(), 200, [0, -100]);
                        // El tiempo hasta que navega a los elementos y ponemos el foco del mouse en el campo
                        // 300 milisegundos
                        setTimeout(function () {
                            oControl.focus();
                        }, 300);
                    }
                },

                // Diseño del mensaje 
                items: {
                    path: "message>/",
                    template: new MessageItem({
                        title: "{message>message}",
                        subtitle: "{message>additionalText}",
                        groupName: {
                            parts: [{
                                path: 'message>controlIds'
                            }], formatter: this.getGroupName
                        },
                        activeTitle: {
                            parts: [{
                                path:
                                    'message>controlIds'
                            }], formatter: this.isPositionable
                        },
                        type: "{message>type}",
                        description: "{message>message}"
                    })
                },
                groupItems: true
            });
            this.getView().byId("messagePopover").addDependent(this.oMP);
        },

        /// para indicar donde esta el error en que grupo 
        getGroupName: function (sControlId) {
            // the group name is generated based on the current layout
            // and is specific for each use case
            var oControl = Element.registry.get(sControlId);
            if (oControl) {
                var sFormSubtitle = oControl.getParent().getParent().getTitle().getText(),
                    sFormTitle = oControl.getParent().getParent().getParent().getTitle();
                return sFormTitle + ", " + sFormSubtitle;
            }
        },

        isPositionable: function (sControlId) {
            // Such a hook can be used by the application to determine if a control can be found/reached on the page and navigated to.
            return sControlId ? true : true;
        },


        validateEmail: function (oEvent) {
            var _value = oEvent.getParameters("value").newValue;
            oEvent.getSource().setProperty("valueState", "None");
            var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
            if (!_value.match(rexMail)) {
                oEvent.getSource().setProperty("valueState", "Error");
            }
        },




        validateTelNumbr: function (oEvent) {
            var _value = oEvent.getParameters("value").newValue;
            oEvent.getSource().setProperty("valueState", "None");
            var rexTel = /^\(?(\d{3})\)?[-]?(\d{3})[-]?(\d{4})$/;  
            if (!_value.match(rexTel)) {
                oEvent.getSource().setProperty("valueState", "Error");
            }
        },





        onBack: function (oEvent) {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("menu", true);
            }
        },

        onSaveUser: function (oEvent) {
         
            //Destroys all the items in the aggregation items.
           // this._MessageManager.removeAllMessages()
                
            const oView = this.getView();
            let oButton = oView.byId("messagePopover");
            let oNameInput =  oView.byId("_IDFullname");
            let oEmailInput = oView.byId("emailInput");
            let oIDTelefono = oView.byId("_IDTelefono");
            oButton.setVisible(true);
            this.handleRequiredField(oNameInput);
           // this.checkInputConstraints('GR1', oEmailInput);
            this.checkInputConstraints('GR2', oIDTelefono);
            
 
           if(  this._MessageManager.getMessageModel().getData().length === 0 )  {

                    const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                    let objectOrder =  oEvent.getSource().getParent().getBindingContext("DatosUser").getObject();
                    let body = {
                        Address: {
                            Firstname: objectOrder.Address.Firstname.toString(),
                            Fullname: objectOrder.Address.Fullname.toString(),
                            EMail: objectOrder.Address.EMail,
                            Tel1Numbr: objectOrder.Address.Tel1Numbr,
                        }
                    };
                    this.getView().getModel("DatosUser").update("/UserBapiSet('CONSULFF')", body, {
                        success: function () {
                            MessageBox.information(oResourceBundle.getText("UserSaved"));
                        },
                        error: function (e) {
                            MessageBox.error(oResourceBundle.getText("UserNotSaved"));
                        },
                    });
           }

           

            this._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
                if (oMessage) {
                    this.oMP.getBinding("items").attachChange(function (oEvent) {
                        this.oMP.navigateBack();
                        oButton.setType(this.buttonTypeFormatter());
                        oButton.setIcon(this.buttonIconFormatter());
                        oButton.setText(this.highestSeverityMessages());
                    }.bind(this));
                    setTimeout(function () {
                        this.oMP.openBy(oButton);
                    }.bind(this), 100);
                }  
                // Es importante este bind ya que con esto le indicamos donde se ejecuta
            }.bind(this));

      

        },
        // Display the number of messages with the highest severity
        highestSeverityMessages: function () {
            //
            var sHighestSeverityIconType = this.buttonTypeFormatter();
            var sHighestSeverityMessageType;

            switch (sHighestSeverityIconType) {
                case "Negative":
                    sHighestSeverityMessageType = "Error";
                    break;
                case "Critical":
                    sHighestSeverityMessageType = "Warning";
                    break;
                case "Success":
                    sHighestSeverityMessageType = "Success";
                    break;
                default:
                    sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
                    break;
            }
            //
            return this._MessageManager.getMessageModel().oData.reduce(function (iNumberOfMessages, oMessageItem) {
                return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
            }, 0) || "";
        },

        // Set the button icon according to the message with the highest severity
        buttonIconFormatter: function () {
            var sIcon;
            var aMessages = this._MessageManager.getMessageModel().oData;
            //
            aMessages.forEach(function (sMessage) {
                switch (sMessage.type) {
                    case "Error":
                        sIcon = "sap-icon://error";
                        break;
                    case "Warning":
                        sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
                        break;
                    case "Success":
                        sIcon = "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
                        break;
                    default:
                        sIcon = !sIcon ? "sap-icon://information" : sIcon;
                        break;
                }
            });

            return sIcon;
        },

	// Display the button type according to the message with the highest severity
		// The priority of the message types are as follows: Error > Warning > Success > Info
		buttonTypeFormatter: function () {
			var sHighestSeverity;
			var aMessages = this._MessageManager.getMessageModel().oData;
			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sHighestSeverity = "Negative";
						break;
					case "Warning":
						sHighestSeverity = sHighestSeverity !== "Negative" ? "Critical" : sHighestSeverity;
						break;
					case "Success":
						sHighestSeverity = sHighestSeverity !== "Negative" && sHighestSeverity !== "Critical" ?  "Success" : sHighestSeverity;
						break;
					default:
						sHighestSeverity = !sHighestSeverity ? "Neutral" : sHighestSeverity;
						break;
				}
			});

			return sHighestSeverity;
		},
        handleMessagePopoverPress: function (oEvent) {
            // Si no esta instanciado
            if (!this.oMP) {
                // creamos la instancia
                this.createMessagePopover();
            }
            this.oMP.toggle(oEvent.getSource());
        },

        upperCase: function  (sVal){
             
             return sVal.toUpperCase();

          }
    });
});  