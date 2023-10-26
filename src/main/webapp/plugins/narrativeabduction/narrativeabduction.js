/**
 * Narrative Abduction plugin contains custom functionalities to support narrative abduction workflow.
 * The registration of this plugin still requires modification of the original app (e.g., app.js, App.js, etc.).
 * External libraries: Sortable.js https://github.com/SortableJS/Sortable
 */
// load plugin
Draw.loadPlugin(function (ui) {
        mxscript("plugins/narrativeabduction/js/narrative.js", function(){
        mxscript("plugins/narrativeabduction/nasettings.js", function(){
        mxscript("plugins/narrativeabduction/js/narrativelistviewcontainer.js", function(){
        mxscript("plugins/narrativeabduction/js/narrativelistview.js", function(){
        mxscript("plugins/narrativeabduction/js/nautil.js", function(){
        mxscript("plugins/narrativeabduction/js/narrativelayout.js", function(){
        mxscript("plugins/narrativeabduction/js/narativelayoutswimlane.js", function(){
        mxscript("plugins/narrativeabduction/narrativegpt/narrativegpt.js", function(){   
        mxscript("plugins/narrativeabduction/narrativegpt/narrativegptauthoring.js", function(){
        mxscript("plugins/narrativeabduction/narrativegpt/narrativegptjsonvalidator.js", function(){
        mxscript("plugins/narrativeabduction/js/narrativeabductionapp.js", function(){
          console.log("EditorUi", ui);
          console.log("Sidebar", ui.sidebar.graph);
          console.log("Editor", ui.editor);            
          new NarrativeAbductionApp(ui);
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