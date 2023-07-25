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

    LoadPalette = function(){
        var sidebar = this.editorui.sidebar;
        console.log("Sidebar", sidebar);
        console.log("Sidebar entries", sidebar.entries);

        //mxResources.get("narrativeabduction")
        Sidebar.prototype.addNarrativeAbductionPalette = function(a) {
            sidebar.setCurrentSearchEntryLibrary("narrative", "abduction");
            sidebar.addPaletteFunctions("narrativeabduction", "Palette", null != a ? a : !1, this.createNarrativeAbductionShapes());
            sidebar.setCurrentSearchEntryLibrary()
        };
    
        var t = this;
        Sidebar.prototype.createNarrativeAbductionShapes = function(){

            var nodes = [];
            var templates = NarrativeAbduction.XMLTemplates;
            for(var i = 0; i < templates.Nodes.length; i++){
                nodes[i] = sidebar.addDataEntry(templates.Nodes[i].Name, 0, 0, templates.Nodes[i].Name, Graph.compress(templates.Nodes[i].XML));
            }

           
            var xml1 = t.CreateContainerGraph1();
            var xml2 = t.CreateContainerGraph2();
            nodes.push(sidebar.addDataEntry("Test", 0, 0, "Test", Graph.compress(xml1)));
            nodes.push(sidebar.addDataEntry("Test 2", 0, 0, "Test", Graph.compress(xml2)));


            return nodes;
        }
    
        sidebar.addNarrativeAbductionPalette();
    }

    CreateContainerGraph1 = function(){
            //Custom
            // Creates the graph inside the given container
            var graph = new mxGraph();
            graph.constrainChildren = false;
            graph.extendParents = false;
            graph.extendParentsOnAdd = false;

            // Uncomment the following if you want the container
            // to fit the size of the graph
            //graph.setResizeContainer(true);
            
            // Enables rubberband selection
            new mxRubberband(graph);
            
            // Gets the default parent for inserting new cells. This
            // is normally the first child of the root (ie. layer 0).
            var parent = graph.getDefaultParent();
                            
            // Adds cells to the model in a single step
            graph.getModel().beginUpdate();
            try
            {
                var v1 = graph.insertVertex(parent, null, 'Container', 20, 20, 200, 200,
                'swimlane;shape=image;imageAspect=0;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;image=https://thenounproject.com/api/private/icons/286718/edit/?backgroundShape=SQUARE&backgroundShapeColor=%23000000&backgroundShapeOpacity=0&exportSize=752&flipX=false&flipY=false&foregroundColor=%23000000&foregroundOpacity=1&imageFormat=png&rotation=0;rotation=0;labelBackgroundColor=#ffffff;labelBorderColor=none;');
                v1.geometry.alternateBounds = new mxRectangle(0, 0, 110, 70);
                var v2 = graph.insertVertex(v1, null, 'World!', 90, 20, 60, 20);
            }
            finally
            {
                // Updates the display
                graph.getModel().endUpdate();
            }

            var encoder = new mxCodec();
            var result = encoder.encode(graph.getModel());
            var xml = mxUtils.getXml(result);

            return xml;
    }

    CreateContainerGraph2 = function(){
        var graph = new mxGraph();
			var parent = graph.getDefaultParent();
			
			// Extends mxGraphModel.getStyle to show an image when collapsed
			var modelGetStyle = graph.model.getStyle;
			graph.model.getStyle = function(cell)
			{
				if (cell != null)
				{
					var style = modelGetStyle.apply(this, arguments);
					
					if (this.isCollapsed(cell))
					{
						style = style + ';shape=image;image=http://www.jgraph.com/images/mxgraph.gif;' +
							'noLabel=1;imageBackground=#C3D9FF;imageBorder=#6482B9';
					}
					
					return style;
				}
				
				return null;
			};
			
			graph.getModel().beginUpdate();
			try
			{
				var v1 = graph.insertVertex(parent, null, 'Container', 20, 20, 200, 200,
					'shape=swimlane;startSize=20;');
				v1.geometry.alternateBounds = new mxRectangle(0, 0, 110, 70);
				var v11 = graph.insertVertex(v1, null, 'Hello,', 10, 40, 120, 80);
			}
			finally
			{
				graph.getModel().endUpdate();
			}

            var encoder = new mxCodec();
            var result = encoder.encode(graph.getModel());
            var xml = mxUtils.getXml(result);

            return xml;
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
};


const NarrativeAbductionNames = {
    NARRATIVEITEM: 'NarrativeItem',
    NARRATIVESET: 'NarrativeSet',
    EVIDENCEITEM: 'EvidenceItem',
    EXPLAINLINK: 'ExplainLinks'
}

class NarrativeAbductionDev {
    constructor(ui) {
        this.editorui = ui;
    }

    Init = function(){
        this.Example();

        var editorui = this.editorui;
        this.editorui.editor.graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {

            console.log("Graph double clicked");
            var cell = evt.getProperty("cell"); // cell may be null
            if (cell != null) {
                console.log("Cell", cell);
                console.log("is Collapsed", cell.isCollapsed());
                if(!cell.isCollapsed()){
                    cell.setStyle("verticalLabelPosition=bottom;verticalAlign=top;html=1;shape=mxgraph.basic.6_point_star");
                }else{
                    cell.setCollapsed(true);
                    cell.setStyle("swimlane;startSize=20;");
                }
                editorui.editor.graph.setSelectionCell(cell);

            }
            evt.consume();
        });
        
    }

    CreatePalette = function(){
        var nodes = [];

        NAUtil.AddPalette(this.editorui.sidebar, "Narrative Abduction", NAUtil.ModelToXML(graph));        
    }

    CreateItemNarrativeItem = function(){
        var doc = mxUtils.createXmlDocument();
        var narrativeitem = doc.createElement(NarrativeAbductionNames.NARRATIVEITEM);
        narrativeitem.setAttribute('Title', 'Untitled Narrative Item');
        narrativeitem.setAttribute('Description', '');
     
        var title = doc.createElement(NarrativeAbductionNames.NARRATIVEITEM + "_title");
        var description = doc.createElement(NarrativeAbductionNames.NARRATIVEITEM + "_description");

        var graph = new mxGraph();
        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        var parent = graph.getDefaultParent();
                        
        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try
        {
            var vnarrativeitem = graph.insertVertex(parent, null, null, 40, 40, 80, 30);
            vnarrativeitem.setStyle("swimlane;");

            var vtitle = graph.insertVertex(vnarrativeitem, null, "<h1>Title</h1>", 200, 150, 80, 30);
            var vdesc = graph.insertVertex(vnarrativeitem, null, "<p>Title</p>", 200, 150, 80, 30);
        }
        finally
        {
            // Updates the display
            graph.getModel().endUpdate();
        }
    }

    Example = function(){       
        // Note that these XML nodes will be enclosing the
				// mxCell nodes for the model cells in the output
				var doc = mxUtils.createXmlDocument();

				var narrativeset = doc.createElement('NarrativeSet');
				narrativeset.setAttribute('Title', 'Untitled narrative');

				var narrativeelement = doc.createElement('NarrativeItem');
				narrativeset.setAttribute('Title', 'Untitled narrative');
				narrativeset.setAttribute('Description', '');

				var explain = doc.createElement('Explains');
				explain.setAttribute('Description', '');
				
				// Creates the graph inside the given container
				var graph = new mxGraph();

				// Optional disabling of sizing
				graph.setCellsResizable(false);
				
								
				// Stops editing on enter key, handles escape
				//new mxKeyHandler(graph);

				// Overrides method to disallow edge label editing
				graph.isCellEditable = function(cell)
				{
					return !this.getModel().isEdge(cell);
				};
				
				// Overrides method to provide a cell label in the display
				// graph.convertValueToString = function(cell)
				// {
				// 	if (mxUtils.isNode(cell.value))
				// 	{
				// 		if (cell.value.nodeName.toLowerCase() == 'person')
				// 		{
				// 			var firstName = cell.getAttribute('firstName', '');
				// 			var lastName = cell.getAttribute('lastName', '');

				// 			if (lastName != null && lastName.length > 0)
				// 			{
				// 				return lastName + ', ' + firstName;
				// 			}

				// 			return firstName;
				// 		}
				// 		else if (cell.value.nodeName.toLowerCase() == 'knows')
				// 		{
				// 			return cell.value.nodeName + ' (Since '
				// 					+  cell.getAttribute('since', '') + ')';
				// 		}

				// 	}

				// 	return '';
				// };

				// Overrides method to store a cell label in the model
				// var cellLabelChanged = graph.cellLabelChanged;
				// graph.cellLabelChanged = function(cell, newValue, autoSize)
				// {
				// 	if (mxUtils.isNode(cell.value) &&
				// 		cell.value.nodeName.toLowerCase() == 'person')
				// 	{
				// 		var pos = newValue.indexOf(' ');

				// 		var firstName = (pos > 0) ? newValue.substring(0,
				// 				pos) : newValue;
				// 		var lastName = (pos > 0) ? newValue.substring(
				// 				pos + 1, newValue.length) : '';

				// 		// Clones the value for correct undo/redo
				// 		var elt = cell.value.cloneNode(true);

				// 		elt.setAttribute('firstName', firstName);
				// 		elt.setAttribute('lastName', lastName);

				// 		newValue = elt;
				// 		autoSize = true;
				// 	}
					
				// 	cellLabelChanged.apply(this, arguments);
				// };

				// Overrides method to create the editing value
				// var getEditingValue = graph.getEditingValue;
				// graph.getEditingValue = function(cell)
				// {
				// 	if (mxUtils.isNode(cell.value) &&
				// 		cell.value.nodeName.toLowerCase() == 'person')
				// 	{
				// 		var firstName = cell.getAttribute('firstName', '');
				// 		var lastName = cell.getAttribute('lastName', '');

				// 		return firstName + ' ' + lastName;
				// 	}
				// };

				// Adds a special tooltip for edges
				graph.setTooltips(true);
				
				var getTooltipForCell = graph.getTooltipForCell;
				graph.getTooltipForCell = function(cell)
				{
					// Adds some relation details for edges
					if (graph.getModel().isEdge(cell))
					{
						var src = this.getLabel(this.getModel().getTerminal(cell, true));
						var trg = this.getLabel(this.getModel().getTerminal(cell, false));

						return src + ' ' + cell.value.nodeName + ' ' +  trg;
					}

					return getTooltipForCell.apply(this, arguments);
				};
				
				// Enables rubberband selection
				new mxRubberband(graph);

				// Adds an option to view the XML of the graph
				document.body.appendChild(mxUtils.button('View XML', function()
				{
					var encoder = new mxCodec();
					var node = encoder.encode(graph.getModel());
					mxUtils.popup(mxUtils.getPrettyXml(node), true);
				}));

				// Changes the style for match the markup
				// Creates the default style for vertices
				var style = graph.getStylesheet().getDefaultVertexStyle();
				style[mxConstants.STYLE_STROKECOLOR] = 'gray';
				style[mxConstants.STYLE_ROUNDED] = true;
				style[mxConstants.STYLE_SHADOW] = true;
				style[mxConstants.STYLE_FILLCOLOR] = '#DFDFDF';
				style[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
				style[mxConstants.STYLE_FONTCOLOR] = 'black';
				style[mxConstants.STYLE_FONTSIZE] = '12';
				style[mxConstants.STYLE_SPACING] = 4;
		
				// Creates the default style for edges
				style = graph.getStylesheet().getDefaultEdgeStyle();
				style[mxConstants.STYLE_STROKECOLOR] = '#0C0C0C';
				style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
				style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
				style[mxConstants.STYLE_ROUNDED] = true;
				style[mxConstants.STYLE_FONTCOLOR] = 'black';
				style[mxConstants.STYLE_FONTSIZE] = '10';
				
				// Gets the default parent for inserting new cells. This
				// is normally the first child of the root (ie. layer 0).
				var parent = graph.getDefaultParent();
								
				// Adds cells to the model in a single step
				graph.getModel().beginUpdate();
				try
				{
					var v1 = graph.insertVertex(parent, null, narrativeset, 40, 40, 80, 30);
					var v2 = graph.insertVertex(v1, null, narrativeelement, 200, 150, 80, 30);
					var e1 = graph.insertEdge(parent, null, explain, v1, v2);
				}
				finally
				{
					// Updates the display
					graph.getModel().endUpdate();
				}


        NAUtil.AddPalette(this.editorui.sidebar, "Example", NAUtil.ModelToXML(graph));
    }
}

class NAUtil {
    static ModelToXML = function(graph){
        var encoder = new mxCodec();
        var result = encoder.encode(graph.getModel());
        var xml = mxUtils.getXml(result);

        return xml;
    }

    static AddPalette = function(sidebar, name, xml){
        var nodes = [sidebar.addDataEntry("Test", 0, 0, name, Graph.compress(xml))];
        //mxResources.get("narrativeabduction")
        sidebar.setCurrentSearchEntryLibrary("narrative", "abduction");
        sidebar.addPaletteFunctions("narrativeabduction", name, !1, nodes);
        sidebar.setCurrentSearchEntryLibrary()         
    }
}

class NarrativeAbductionUI{
    constructor(ui) {
        this.editorui = ui;
    }

    AddButton = function(label, funct)
    {
        var btn = document.createElement('div');
        mxUtils.write(btn, label);
        btn.style.position = 'absolute';
        btn.style.backgroundColor = 'transparent';
        btn.style.border = '1px solid gray';
        btn.style.textAlign = 'center';
        btn.style.fontSize = '10px';
        btn.style.cursor = 'hand';
        btn.style.width = bw + 'px';
        btn.style.height = bh + 'px';
        btn.style.left = left + 'px';
        btn.style.top = '0px';
        
        mxEvent.addListener(btn, 'click', function(evt)
        {
            funct();
            mxEvent.consume(evt);
        });
        
        left += bw;
        
        buttons.appendChild(btn);
    };
}

// load plugin
Draw.loadPlugin(function(ui) {
    console.log("EditorUi", ui);
    console.log("Sidebar", ui.sidebar.graph);
    console.log("Editor", ui.editor);


    var na = new NarrativeAbductionDev(ui);
    na.Init();
});
