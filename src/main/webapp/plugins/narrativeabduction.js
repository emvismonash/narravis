/**
 * Narrative Abduction plugin contains custom functionalities to support narrative abduction workflow. 
 * The registration of this plugin still requires modification of the original app (e.g., app.js, App.js, etc.).  
 */
// load plugin
Draw.loadPlugin(function(ui) {
    console.log("EditorUi",  ui);
    console.log("Sidebar", ui.sidebar.graph);
    console.log("Editor", ui.editor);

    var na = new NarrativeAbductionDev(ui);
    na.init();
});


class NASettings{
    //base on https://docs.google.com/document/d/1FByhhJe67pJC6fPdE3lo8lgM6NN7K0_Uivf6n5Io9UE/edit
    static Dictionary = {
        CELLS:{
            NARRATIVEITEM: 'NarrativeItem',
            NARRATIVEEVIDENCECORE: "NarrativeEvidenceCore",             
            JOINTCAUSE: "JointCause",
            EVIDENCENARRATIVESPECIFIC: "EvidenceNarrativeSpecific", 
            SUPPORTINGARGUMENT: "SupportingArgument",
            NARRATIVESET: 'NarrativeSet',
            EVIDENCEITEM: 'EvidenceItem',
            EXPLAINLINK: 'ExplainLinks',
        },
        UI: {
            DOCUMENTITEMWINDOW : 'DocumentItemWindow'
        }
    }
}

class NarrativeAbductionDev {

    constructor(ui) {
        this.editorui = ui;
        this.windowRegistry = {};
        this.naentries = [];
    }


    init = function(){
        this.createPalette();     
        this.overrideShapePicker();
    }

    createPalette = function(){
        this.naentries = [
            {
                name: NASettings.Dictionary.CELLS.NARRATIVEITEM,              
                style: ""            
            },
            {
                name: NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE,
                style: "fillColor=#fad7ac;strokeColor=#b46504;rounded=0;"
            },
            {
                name: NASettings.Dictionary.CELLS.JOINTCAUSE,
                style: ""
            },
            {
                name: NASettings.Dictionary.CELLS.EVIDENCENARRATIVESPECIFIC,
                style: "fillColor=#fad9d5;strokeColor=#ae4132;rounded=0;"
            },
            {
                name: NASettings.Dictionary.CELLS.SUPPORTINGARGUMENT,
                style: "fillColor=#dae8fc;strokeColor=#6c8ebf;rounded=1;"
            }   

        ];

        var entries = [];
        for(var i = 0; i < this.naentries.length;i++){

            var res = this.createDocumentItem(this.naentries[i].name,  
                NAUtil.GetCellChildrenLabels(this.naentries[i].name).title, 
                NAUtil.GetCellChildrenLabels(this.naentries[i].name).description, 
                this.naentries[i].style);
            this.naentries[i].xml = res.xml;
            this.naentries[i].graph = res.graph;                
            
             entries.push(
                this.editorui.sidebar.addDataEntry(
                    this.naentries[i].name, 0, 0, this.naentries[i].name, Graph.compress(this.naentries[i].xml))
                    );
        }
       
        console.log("Entires", entries);
        NAUtil.AddPalette(this.editorui.sidebar, "Narrative Abduction", entries);        
    }

    /**
     * Shape-picker override to show NA cells
     */
    overrideShapePicker = function(){
        //override
        var t = this;
        this.editorui.getCellsForShapePicker = function(cell, hovering, showEdges){

            //somehow the style fails, we need to override it 
            var newcells = [];
            t.naentries.forEach(function(currentValue, index, arr){
                    console.log("c", currentValue);
                    var cell = NAUtil.GetCellByNodeName(currentValue.graph, currentValue.name);
                    var g = currentValue.graph;
                    g.getModel().setStyle(cell, currentValue.style);
                    newcells.push(cell);  
             });

            console.log("Shape-picker new cells", newcells);

            return newcells;
        };
    }

    /**
     * Create document item cell for the Shape picker and Palette
     * @returns 
     */
    createDocumentItem = function(itemname, titlename, descrname, s){
        var doc = mxUtils.createXmlDocument();
        var objna = doc.createElement(itemname);
        var objtitle = doc.createElement(titlename);
        var objdescription = doc.createElement(descrname);

        var graph = new mxGraph();
        var parent = graph.getDefaultParent();
                           
        graph.getModel().beginUpdate();
        var nodenaitem;
        try
        {
            nodenaitem = graph.insertVertex(parent, null, objna, 200, 150, 350, 150);
            nodenaitem.setStyle(s);
            var nodetitle = graph.insertVertex(nodenaitem, null, objtitle, 10, 10, 320, 30);
            nodetitle.setStyle("text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;rounded=0;fontStyle=1;fontSize=17;fontColor=default;labelBorderColor=none;labelBackgroundColor=none;resizable=0;allowArrows=0;movable=0;rotatable=0;cloneable=0;deletable=0;pointerEvents=0;");
            nodetitle.value = titlename;
            nodetitle.setConnectable(false);
            
            var nodedesc = graph.insertVertex(nodenaitem, null, objdescription, 10, 50, 320, 150);
            nodedesc.setStyle("text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;allowArrows=0;movable=0;resizable=0;rotatable=0;cloneable=0;deletable=0;pointerEvents=0;");
            nodedesc.value = "Desription";
            nodedesc.setConnectable(false);
        }
        finally
        {
            graph.getModel().endUpdate();
        }

        var currgraph = this.editorui.editor.graph;
        var na = this;

        // Add on click listener to show the Narrative Item window
        NAUtil.AddNodeClickListener(currgraph, itemname, function(cell){
            var cellName =  cell.children[0].value;
            var cellDesc = cell.children[1].value;

            console.log("Document item clicked");
            console.log("Graph", currgraph);
            console.log("Cell", cell);
            console.log("Name", cellName);
            console.log("Description", cellDesc);

            var wnd = NAUtil.GetWindowById(NASettings.Dictionary.UI.DOCUMENTITEMWINDOW, na.windowRegistry);

            if(wnd == null)
            {
                var formContainer = document.createElement('div');
                formContainer.style.width = "200px";
                formContainer.style.padding = "20px";
    
                const form = document.createElement('form');
                form.id = 'narrativeitemform';
    
                const nameLabel = document.createElement('label');
                nameLabel.textContent = 'Name:';
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.id = 'name';
                nameInput.name = 'name';
                nameInput.required = true;
    
                const br = document.createElement('br');
    
                const descriptionLabel = document.createElement('label');
                descriptionLabel.textContent = 'Description:';
                const descriptionTextarea = document.createElement('textarea');
                descriptionTextarea.id = 'description';
                descriptionTextarea.name = 'description';
                descriptionTextarea.rows = 4;
                descriptionTextarea.cols = 50;
    
                const applyButton = document.createElement('button');
                applyButton.id = 'applyButton';
                applyButton.type = 'button';
                applyButton.textContent = 'Apply';
    
                // Add elements to the form
                form.appendChild(nameLabel);
                form.appendChild(nameInput);
                form.appendChild(br);
                form.appendChild(descriptionLabel);
                form.appendChild(descriptionTextarea);
                form.appendChild(br.cloneNode(false)); // Create a new line break for spacing
                form.appendChild(applyButton);
    
                // Add the form to the container
                formContainer.appendChild(form);
    
                wnd = NAUtil.CreateWindow(NASettings.Dictionary.UI.DOCUMENTITEMWINDOW, NASettings.Dictionary.UI.DOCUMENTITEMWINDOW, formContainer, 100, 100, 400, 200, na.windowRegistry);
            }

            const nameInput = document.getElementById("name");
            nameInput.value = cellName;
            const descriptionTextarea = document.getElementById("description");
            descriptionTextarea.value = cellDesc;
            const applyButton = document.getElementById("applyButton");
            applyButton.onclick = applyForm(currgraph, cell);
            const form = document.getElementById("narrativeitemform");
            form.onsubmit =  function(event) {
                event.preventDefault();
                return false;
            }
            

            function applyForm(currgraph, c, n, d) {
                return function(){

                    const nameInput = document.getElementById("name");
                    const descriptionTextarea = document.getElementById("description");

                    console.log("Graph", currgraph);
                    console.log("Cell", c);

                    console.log("Name", n);
                    console.log("Des", d);


                    currgraph.getModel().beginUpdate();        
                    try
                    {
                        currgraph.model.setValue(c.children[0], nameInput.value);
                        currgraph.model.setValue(c.children[1], descriptionTextarea.value);
                    }
                    finally
                    {
                        currgraph.getModel().endUpdate();
                    }
                    console.log("Cell", c);
                }
            };
            wnd.setVisible(true);        
        });
       
        return {
            xml: NAUtil.ModelToXML(graph),
            graph: graph,
            cell: nodenaitem
        }
    }
}

class NAUtil {

    static GetCellChildrenLabels = function(name){
        return {
            title: name+"Title",
            description : name+"Description"
        }
    }

    static ModelToXML = function(graph){
        var encoder = new mxCodec();
        var result = encoder.encode(graph.getModel());
        var xml = mxUtils.getXml(result);

        return xml;
    }

    static GetCellByNodeName = function(graph, name){
        console.log("Graph", graph);
        var cells = graph.model.getCells();
        console.log("Celss", graph.model.getCells());
        for(var i = 0; i < cells.length; i++){
            console.log("Cell", cells[i]);
            if(!cells[i].value) continue;
            if(cells[i].value.nodeName == name){
                console.log(cells[i].style);
                return cells[i];
            }
        }
    }

    static Decycle = function(obj, stack = []) {
        if (!obj || typeof obj !== 'object')
            return obj;
        
        if (stack.includes(obj))
            return null;
    
        let s = stack.concat([obj]);
    
        return Array.isArray(obj)
            ? obj.map(x => NAUtil.Decycle(x, s))
            : Object.fromEntries(
                Object.entries(obj)
                    .map(([k, v]) => [k, NAUtil.Decycle(v, s)]));
    }

    static AddNodeClickListener = function(graph, name, f){
        graph.addListener(mxEvent.CLICK, function (sender, evt) {
            var cell = evt.getProperty("cell"); // cell may be null
            if(cell != null && cell.value != null && cell.value.nodeName == name){
                f(cell);
            }
            evt.consume();
        });
    }

    static AddPalette = function(sidebar, name, nodes){
      //  var nodes = [sidebar.addDataEntry("Test", 0, 0, name, Graph.compress(xml))];
        //mxResources.get("narrativeabduction")
        sidebar.setCurrentSearchEntryLibrary("narrative", "abduction");
        sidebar.addPaletteFunctions("narrativeabduction", name, !1, nodes);
        sidebar.setCurrentSearchEntryLibrary()         
    }

    static CreateWindow = function(id, title, content, x, y, width, height, registry) {
        const wnd = new mxWindow(title, content, x, y, width, height, true, true);
        wnd.setResizable(false);
        wnd.setScrollable(false);
       // wnd.setClosable(true);
      
        registry[id] = wnd;      
        return wnd;
      }

    static GetWindowById = function(id, registry) {
        return registry[id] || null;
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

