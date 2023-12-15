/**
 * Narrvis plugin contains custom functionalities to support narrative abduction workflow.
 * The registration of this plugin still requires modification of the original app (e.g., app.js, App.js, etc.).
 */
// load plugin
Draw.loadPlugin(function (ui) {
        mxscript("plugins/narrativeabduction/core/narrative.js", function(){
        mxscript("plugins/narrativeabduction/nasettings.js", function(){
        mxscript("plugins/narrativeabduction/view/narrativelistviewcontainer.js", function(){
        mxscript("plugins/narrativeabduction/view/narrativelistview.js", function(){
        mxscript("plugins/narrativeabduction/view/narrativelayoutswimlanewindow.js", function(){
        mxscript("plugins/narrativeabduction/utility/nautil.js", function(){
        mxscript("plugins/narrativeabduction/utility/nauihelper.js", function(){  
        mxscript("plugins/narrativeabduction/layout/narrativelayout.js", function(){
        mxscript("plugins/narrativeabduction/layout/narrativelane.js", function(){
        mxscript("plugins/narrativeabduction/layout/narrativelanescontroller.js", function(){
        mxscript("plugins/narrativeabduction/gpt/narrativegpt.js", function(){   
        mxscript("plugins/narrativeabduction/gpt/narrativegptauthoring.js", function(){
        mxscript("plugins/narrativeabduction/gpt/narrativegptjsonvalidator.js", function(){
        mxscript("plugins/narrativeabduction/examples/narrativeexamples.js", function(){
        mxscript("plugins/narrativeabduction/core/narrativeabductionapp.js", function(){       
          let app = new NarrativeAbductionApp(ui);
          console.log(ui);
          ui.editor.addListener("fileLoaded", function(sender, evt) {
            app.initiate();                      
          });

        });
        });
        });
        });
        });
        });
        });                                                              
        });               
        });
        });                  
        });
        });
        });
        });
        });
});