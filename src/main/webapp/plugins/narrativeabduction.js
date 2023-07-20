/**
 * Narrative Abduction plugin contains custom functionalities to support narrative abduction workflow. 
 * The registration of this plugin still requires modification of the original app (e.g., app.js, App.js, etc.).  
 */
class NarrativeAbduction{
    constructor(ui) {
        this.editorui = ui;
    }
    
    static XMLTemplates = {
        Nodes:[
            {
                Name: "Test", 
                XML: '<mxGraphModel>   <root>     <mxCell id="0" />     <mxCell id="1" parent="0" />     <Person firstName="Daffy" lastName="Duck" id="2">       <mxCell vertex="1" parent="1">         <mxGeometry x="40" y="40" width="80" height="30" as="geometry" />       </mxCell>     </Person>     <Person firstName="Bugs" lastName="Bunny" id="3">       <mxCell vertex="1" parent="1">         <mxGeometry x="360" y="230" width="80" height="30" as="geometry" />       </mxCell>     </Person>     <Knows since="1985" id="4">       <mxCell edge="1" parent="1" source="2" target="3">         <mxGeometry relative="1" as="geometry" />       </mxCell>     </Knows>   </root> </mxGraphModel>'
            },
            {
                Name: 'Evidence',
                XML: '<mxGraphModel dx="1434" dy="754" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">   <root>     <mxCell id="0" />     <mxCell id="1" parent="0" />     <mxCell id="u8A2PjSUJfAg24CJGaup-23" value="Evidence" style="swimlane;strokeColor=#314354;strokeWidth=2;fillColor=#647687;fontColor=#ffffff;" vertex="1" parent="1">       <mxGeometry x="280" y="460" width="200" height="150" as="geometry">         <mxRectangle x="280" y="460" width="90" height="30" as="alternateBounds" />       </mxGeometry>     </mxCell>     <mxCell id="u8A2PjSUJfAg24CJGaup-24" value="&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.&lt;/p&gt;" style="text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;movable=1;resizable=1;rotatable=1;deletable=1;editable=1;locked=0;connectable=1;" vertex="1" parent="u8A2PjSUJfAg24CJGaup-23">       <mxGeometry x="10" y="33" width="180" height="110" as="geometry" />     </mxCell>   </root> </mxGraphModel> ',
            },
            {
                Name: 'Narrative',
                XML: '<mxGraphModel dx="1434" dy="754" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">   <root>     <mxCell id="0" />     <mxCell id="1" parent="0" />     <mxCell id="mhbCEr3vP2NVnHhqcfwW-10" value="Narrative Item" style="swimlane;startSize=20;horizontal=1;containerType=tree;rounded=1;fillColor=#d5e8d4;strokeColor=#82b366;swimlaneFillColor=default;" vertex="1" parent="1">       <mxGeometry x="310" y="270" width="200" height="150" as="geometry">         <mxRectangle x="270" y="260" width="120" height="30" as="alternateBounds" />       </mxGeometry>     </mxCell>     <mxCell id="mhbCEr3vP2NVnHhqcfwW-11" value="&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.&lt;/p&gt;" style="text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;movable=1;resizable=1;rotatable=1;deletable=1;editable=1;locked=0;connectable=1;" vertex="1" parent="mhbCEr3vP2NVnHhqcfwW-10">       <mxGeometry x="10" y="30" width="180" height="110" as="geometry" />     </mxCell>   </root> </mxGraphModel> '
            },
            {
                Name: 'NarrativeInstance',
                XML: '<mxGraphModel dx="1254" dy="754" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">   <root>     <mxCell id="0" />     <mxCell id="1" parent="0" />     <object label="Narrative Container" id="z_U0UqNSdMYtfjJYA89s-1">       <mxCell style="swimlane;startSize=20;horizontal=0;childLayout=treeLayout;horizontalTree=1;resizable=0;containerType=tree;fillColor=#f5f5f5;strokeColor=#666666;fontColor=#333333;" vertex="1" parent="1">         <mxGeometry x="140" y="170" width="760" height="380" as="geometry">           <mxRectangle x="230" y="670" width="150" height="30" as="alternateBounds" />         </mxGeometry>       </mxCell>     </object>     <mxCell id="z_U0UqNSdMYtfjJYA89s-2" value="Narrative Item" style="swimlane;startSize=20;horizontal=1;containerType=tree;rounded=1;fillColor=#d5e8d4;strokeColor=#82b366;swimlaneFillColor=default;" vertex="1" parent="z_U0UqNSdMYtfjJYA89s-1">       <mxGeometry x="40" y="115" width="200" height="150" as="geometry">         <mxRectangle x="40" y="175" width="120" height="30" as="alternateBounds" />       </mxGeometry>     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-3" value="&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.&lt;/p&gt;" style="text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;movable=1;resizable=1;rotatable=1;deletable=1;editable=1;locked=0;connectable=1;" vertex="1" parent="z_U0UqNSdMYtfjJYA89s-2">       <mxGeometry x="10" y="30" width="180" height="110" as="geometry" />     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-4" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="z_U0UqNSdMYtfjJYA89s-1" source="z_U0UqNSdMYtfjJYA89s-2" target="z_U0UqNSdMYtfjJYA89s-5">       <mxGeometry relative="1" as="geometry" />     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-5" value="Narrative Item" style="swimlane;startSize=20;horizontal=1;containerType=tree;rounded=1;fillColor=#d5e8d4;strokeColor=#82b366;swimlaneFillColor=default;" vertex="1" parent="z_U0UqNSdMYtfjJYA89s-1">       <mxGeometry x="290" y="20" width="200" height="150" as="geometry">         <mxRectangle x="210" y="20" width="120" height="30" as="alternateBounds" />       </mxGeometry>     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-6" value="&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.&lt;/p&gt;" style="text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;movable=1;resizable=1;rotatable=1;deletable=1;editable=1;locked=0;connectable=1;" vertex="1" parent="z_U0UqNSdMYtfjJYA89s-5">       <mxGeometry x="10" y="30" width="180" height="110" as="geometry" />     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-7" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="z_U0UqNSdMYtfjJYA89s-1" source="z_U0UqNSdMYtfjJYA89s-2" target="z_U0UqNSdMYtfjJYA89s-8">       <mxGeometry relative="1" as="geometry" />     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-8" value="Narrative Item" style="swimlane;startSize=20;horizontal=1;containerType=tree;rounded=1;fillColor=#d5e8d4;strokeColor=#82b366;swimlaneFillColor=default;" vertex="1" parent="z_U0UqNSdMYtfjJYA89s-1">       <mxGeometry x="290" y="210" width="200" height="150" as="geometry">         <mxRectangle x="270" y="260" width="120" height="30" as="alternateBounds" />       </mxGeometry>     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-9" value="&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.&lt;/p&gt;" style="text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;movable=1;resizable=1;rotatable=1;deletable=1;editable=1;locked=0;connectable=1;" vertex="1" parent="z_U0UqNSdMYtfjJYA89s-8">       <mxGeometry x="10" y="30" width="180" height="110" as="geometry" />     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-45" value="Evidence" style="swimlane;strokeColor=#314354;strokeWidth=2;fillColor=#647687;fontColor=#ffffff;" vertex="1" parent="z_U0UqNSdMYtfjJYA89s-1">       <mxGeometry x="540" y="20" width="200" height="150" as="geometry">         <mxRectangle x="280" y="460" width="90" height="30" as="alternateBounds" />       </mxGeometry>     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-46" value="&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.&lt;/p&gt;" style="text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;movable=1;resizable=1;rotatable=1;deletable=1;editable=1;locked=0;connectable=1;" vertex="1" parent="z_U0UqNSdMYtfjJYA89s-45">       <mxGeometry x="10" y="33" width="180" height="110" as="geometry" />     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-47" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="z_U0UqNSdMYtfjJYA89s-1" source="z_U0UqNSdMYtfjJYA89s-5" target="z_U0UqNSdMYtfjJYA89s-45">       <mxGeometry relative="1" as="geometry" />     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-48" value="Evidence" style="swimlane;strokeColor=#314354;strokeWidth=2;fillColor=#647687;fontColor=#ffffff;" vertex="1" parent="1">       <mxGeometry x="430" y="580" width="200" height="150" as="geometry">         <mxRectangle x="280" y="460" width="90" height="30" as="alternateBounds" />       </mxGeometry>     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-49" value="&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.&lt;/p&gt;" style="text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;movable=1;resizable=1;rotatable=1;deletable=1;editable=1;locked=0;connectable=1;" vertex="1" parent="z_U0UqNSdMYtfjJYA89s-48">       <mxGeometry x="10" y="33" width="180" height="110" as="geometry" />     </mxCell>     <mxCell id="z_U0UqNSdMYtfjJYA89s-50" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" edge="1" parent="1" source="z_U0UqNSdMYtfjJYA89s-8" target="z_U0UqNSdMYtfjJYA89s-48">       <mxGeometry relative="1" as="geometry" />     </mxCell>   </root> </mxGraphModel> '
            }
        ],
        Links:[]
    }
       

    Init = function(){
        this.LoadPalette();
        this.LoadUI();
        this.UpdateHoverIcons();
    }
    
    DisableMoreShapes = function(){

    }

    LoadPalette = function(){
        var sidebar = this.editorui.sidebar;

        //mxResources.get("narrativeabduction")
        Sidebar.prototype.addNarrativeAbductionPalette = function(a) {
            sidebar.setCurrentSearchEntryLibrary("narrative", "abduction");
            sidebar.addPaletteFunctions("narrativeabduction", "Palette", null != a ? a : !1, this.createNarrativeAbductionShapes());
            sidebar.setCurrentSearchEntryLibrary()
        };
    
        Sidebar.prototype.createNarrativeAbductionShapes = function(){

            var nodes = [];
            var templates = NarrativeAbduction.XMLTemplates;
            for(var i = 0; i < templates.Nodes.length; i++){
                nodes[i] = sidebar.addDataEntry(templates.Nodes[i].Name, 0, 0, templates.Nodes[i].Name, Graph.compress(templates.Nodes[i].XML));
            }
            return nodes;
        }
    
        sidebar.addNarrativeAbductionPalette();
    }

    LoadUI = function(){
        this.CreateUIContainer();
        var a = this;


        this.AddFunction('Show model', function(){
            var encoder = new mxCodec();
            var node = encoder.encode(a.editorui.currentPage.graphModelNode);
            mxUtils.popup(mxUtils.getPrettyXml(node), true);
         });       
        this.AddFunction('To object', function(){
            var enc = new mxCodec();
            var obj = enc.decode(a.editorui.currentPage.graphModelNode);
            console.log("Current obj", obj);
        });       
    }

    UpdateHoverIcons = function(){
        console.log("Hovericons", this.editorui.actions.editorUi.hoverIcons);
        this.editorui.actions.editorUi.hoverIcons.removeNodes();
    }

    CreateUIContainer = function(){
        var sidebar = this.editorui.sidebar;
        var napalette = sidebar.palettes.narrativeabduction;
        console.log(napalette); 

        //create container
        var uicontainer = document.createElement('div');
        uicontainer.id = 'na-ui-container';
        uicontainer.style.padding = '10px';
        var uicontatinertitle = document.createElement('div');
        uicontatinertitle.innerText = 'Functions';
        uicontainer.append(uicontatinertitle);
        var uipanel = document.createElement('div');
        uicontainer.append(uipanel);

        this.uicontainer = uicontainer;
        this.uipanel = uipanel;

        napalette[1].append(this.uicontainer);
    }

    AddFunction = function(label, f){
        //create button
        var button = document.createElement("button");
        console.log(button); 

        button.classList.add('geBtn');
        button.innerText = label;
        button.onclick = f;

        //add uis to container
        this.uipanel.append(button);
    }
};

// load plugin
Draw.loadPlugin(function(ui) {
    var na = new NarrativeAbduction(ui);
    na.Init();
    console.log(na.editorui);
});
