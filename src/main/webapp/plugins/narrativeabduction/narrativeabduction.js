/**
 * Narrative Abduction plugin contains custom functionalities to support narrative abduction workflow.
 * The registration of this plugin still requires modification of the original app (e.g., app.js, App.js, etc.).
 * External libraries: Sortable.js https://github.com/SortableJS/Sortable
 */
// load plugin
Draw.loadPlugin(function (ui) {
        mxscript("plugins/narrativeabduction/narrative.js", function(){
            mxscript("plugins/narrativeabduction/nasettings.js", function(){
                mxscript("plugins/narrativeabduction/narrativelistviewcontainer.js", function(){
                    mxscript("plugins/narrativeabduction/narrativelistview.js", function(){
                        mxscript("plugins/narrativeabduction/nautil.js", function(){
                          mxscript("plugins/narrativeabduction/narrativelayout.js", function(){
                            mxscript("plugins/narrativeabduction/narativelayoutswimlane.js", function(){
                              mxscript("plugins/narrativeabduction/narrativeabductionapp.js", function(){
                                console.log("EditorUi", ui);
                                console.log("Sidebar", ui.sidebar.graph);
                                console.log("Editor", ui.editor);            
                                let na = new NarrativeAbductionApp(ui);
                                na.init();   
                              });                   
                            });
                          });                  
                        });
                    });
                });
            });   
        });
});
