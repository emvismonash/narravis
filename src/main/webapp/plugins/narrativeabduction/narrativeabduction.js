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
                            console.log("EditorUi", ui);
                            console.log("Sidebar", ui.sidebar.graph);
                            console.log("Editor", ui.editor);            
                            var na = new NarrativeAbductionApp(ui);
                            na._init();                      
                          });                  
                        });
                    });
                });
            });   
        });
});


class NarrativeAbductionApp {
  #event;
  constructor(ui) {
    this.editorui = ui;
    this.panelwindow;
    this.narrativeaviewscontainer;
    this.narratives = [];
    this.narrativelayout = new NarrativeLayout(this);
    this.narrativelayout.graph = ui.editor.graph;

    this.settings = {
      lodupdate: 5.5,
    };
    this.narrativelistcell;
    this.myEvent = new CustomEvent("newnarrative", {
      narrative: {},
      bubbles: true,
      cancelable: true,
      composed: false,
    });
    this.excludefrompicker = [
      NASettings.Dictionary.CELLS.NARRATIVELIST,
      NASettings.Dictionary.CELLS.NARRATIVE,
    ];
    this.naentries = [
      {
        name: NASettings.Dictionary.CELLS.NARRATIVELIST,
        style:
          "swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=26;fillColor=none;horizontalStack=0;connectable=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;",
        type: "node",
      },
      {
        name: NASettings.Dictionary.CELLS.NARRATIVE,
        style:
          "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=35;connectable=0;",
        type: "node",
      },
      {
        name: NASettings.Dictionary.CELLS.NARRATIVEITEM,
        style:
          "editable=1;rounded=1;whiteSpace=wrap;html=1;fontColor=#333333;strokeColor=none;",
        type: "node",
      },
      {
        name: NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE,
        style: "editable=1;rounded=0;whiteSpace=wrap;html=1;",
        type: "node",
      },
      {
        name: NASettings.Dictionary.CELLS.EXPLAINLINK,
        style: "editable=1;endArrow=classic;html=1;rounded=0;strokeWidth=3;strokeColor=#00CC00;",
        type: "edge",
      },
      {
        name: NASettings.Dictionary.CELLS.CAUSELINK,
        style: "editable=1;endArrow=classic;html=1;rounded=1;strokeWidth=3;",
        type: "edge",
      },
      {
        name: NASettings.Dictionary.CELLS.TRIGGERLINK,
        style:
          "editable=0;endArrow=classic;html=1;rounded=1;strokeWidth=3;dashed=1;",
        type: "edge",
      },
      {
        name: NASettings.Dictionary.CELLS.ENABLELINK,
        style:
          "editable=0;endArrow=classic;html=1;rounded=0;strokeWidth=3;dashed=1;dashPattern=1 1;strokeColor=#FF3333;",
        type: "edge",
      },
      {
        name: NASettings.Dictionary.CELLS.SUPPORTLINK,
        style:
          "editable=0;endArrow=classic;html=1;rounded=0;strokeWidth=3;strokeColor=#006600;",
        type: "edge",
      },
      {
        name: NASettings.Dictionary.CELLS.MOTIVATELINK,
        style: "editable=0;shape=flexArrow;endArrow=classic;html=1;rounded=0;",
        type: "edge",
      },
      {
        name: NASettings.Dictionary.CELLS.CONFLICTLINK,
        style:
          "editable=0;editable=1;endArrow=cross;html=1;rounded=0;movable=1;resizable=1;rotatable=1;deletable=1;locked=0;connectable=1;startArrow=none;startFill=0;endFill=0;strokeWidth=2;strokeColor=#ff0000;",
        type: "edge",
      },
    ];
    this.documentcellwidth = 350;
    this.documentcellheight = 200;
    this.documentitemminwidth = 250;
    this.documentitemminheight = 150;
    this.titlecellstyle =
      "html=1;text;moveable=0;strokeColor=none;fillColor=none;overflow=fill;align=left;verticalAlign=middle;rounded=0;fontStyle=1;fontSize=17;fontColor=default;labelBorderColor=none;labelBackgroundColor=none;resizable=0;allowArrows=0;rotatable=0;cloneable=0;deletable=0;pointerEvents=0;fixedWidth=1;";
    this.descriptioncellstyle =
      "html=1;text;moveable=0;whiteSpace=wrap;overflow=block;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;rounded=0;allowArrows=0;resizable=0;rotatable=0;cloneable=0;deletable=0;pointerEvents=0;autosize=1;resizeHeight=1;fixedWidth=1;";
    this.titlecellheight = 50;
    this.titlecellcontenthmtlstyle =
      "padding:5px;padding-left:15px;text-align:center;";
    this.descriptioncellcontenthtmlstyle =
      "padding:5px;padding-left:15px;min-height:150px;";
  }

  /**
   * Initialisation
   */
  _init = function () {
    this.createNAPanel();
    this.createNarrativesView();
    this.createPalette();
    //this.installStackedLayout();
    this.initListenerResponsiveSizeHandlerVanilaContent();
    this.initListenerDocumentSizeAfterDescriptionEdit();
    this.initOverrideConvertValueString();
    this.initOverrideShapePickerHandler();
    this.initOverrrideNewCellHandler();
    this.initListenerRemoveNarrativeCellHandler();
    this.initListenerEdgeDoubleClickEditHandler();
    this.updateMoreShapesButton();
    this.loadExistingNarratives();
  };

  /**
   * Assign the narrative cell into the narrative list
   * @param {*} cell
   */
  addNarrativeCellToList = function (cell) {
    if (this.narrativelistcell) {
      //console.log("this.narrativelistcell", this.narrativelistcell);
      var graph = this.editorui.editor.graph;
      graph.getModel().beginUpdate();
      try {
        graph.getModel().add(this.narrativelistcell, cell);
        var layout = new mxStackLayout(graph, true);
        layout.execute(this.narrativelistcell);
        // cell.setParent();
      } finally {
        graph.getModel().endUpdate();
      }
    }
  };

  /**
   * Create link. This is still not working well as it creates two empty nodes
   * @param {*} itemname
   * @param {*} style
   * @returns
   */
  createLinkItem = function (itemname, style) {
    var graph = new mxGraph();
    var parent = graph.getDefaultParent();
    graph.getModel().beginUpdate();
    var linkcell;
    try {
      var v1 = graph.insertVertex(
        parent,
        null,
        null,
        200,
        0,
        1,
        1,
        "opacity=0;"
      );
      var v2 = graph.insertVertex(parent, null, null, 0, 0, 1, 1, "opacity=0;");

      linkcell = graph.insertEdge(parent, null, "", v2, v1);
      linkcell.setStyle(style);
      linkcell.value = itemname;
    } finally {
      graph.getModel().endUpdate();
    }
    return {
      xml: NAUtil.ModelToXML(graph),
      graph: graph,
      cell: linkcell,
    };
  };

  /**
   * Create a document node in HTML content format
   * @param {*} graph
   * @param {*} entry
   * @returns
   */
  createDocumentItemHTMLCell = function (graph, entry) {
    var itemname = entry.name;
    var titlename = entry.titlename;
    var descrname = entry.descrname;
    var style = entry.style;

    var doc = mxUtils.createXmlDocument();
    var docmain = doc.createElement(itemname);
    var doccontent = doc.createElement(NASettings.Dictionary.UI.NAHTMLCONTENT);
    docmain.setAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE, itemname);
    //these attributes can be used to visualise the document item
    doccontent.setAttribute(
      NASettings.Dictionary.ATTRIBUTTES.NATYPE,
      NASettings.Dictionary.UI.NAHTMLCONTENT
    );
    docmain.setAttribute(NASettings.Dictionary.ATTRIBUTTES.DOCTITLE, titlename);
    docmain.setAttribute(
      NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION,
      descrname
    );

    var parent = graph.getDefaultParent();
    var documentcell;
    var contentcell;
    try {
      documentcell = graph.insertVertex(
        parent,
        null,
        docmain,
        200,
        150,
        350,
        150
      );
      documentcell.setStyle(style);
      contentcell = graph.insertVertex(
        documentcell,
        null,
        doccontent,
        0,
        20,
        350,
        130
      );
      contentcell.setStyle(
        "html=1;movable=0;editable=0;whiteSpace=wrap;overflow=hidden;resizable=0;rotatable=0;deletable=0;locked=0;connectable=0;"
      );
      this.updateHTMLDocumentItemAppearance(documentcell, contentcell); // here is the visualisation happens
      //disable direct edit
    } finally {
      graph.getModel().endUpdate();
    }
    return documentcell;
  };

  /**
   * Create the cell for a document item in label + content format
   * @param {*} graph
   * @param {*} entry
   * @returns
   */
  createDocumentItemCell = function (graph, entry) {
    var itemname = entry.name;
    var titlename = entry.titlename;
    var descrname = entry.descrname;
    var style = entry.style;

    var doc = mxUtils.createXmlDocument();
    var objna = doc.createElement(itemname);
    objna.setAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE, itemname);

    var objtitle = doc.createElement(titlename);
    objtitle.setAttribute(
      NASettings.Dictionary.ATTRIBUTTES.NATYPE,
      NASettings.Dictionary.ATTRIBUTTES.DOCTITLE
    );

    var objdescription = doc.createElement(descrname);
    objdescription.setAttribute(
      NASettings.Dictionary.ATTRIBUTTES.NATYPE,
      NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION
    );

    var parent = graph.getDefaultParent();
    var documentcell;
    try {
      documentcell = graph.insertVertex(
        parent,
        null,
        objna,
        200,
        150,
        this.documentcellwidth,
        this.documentcellheight
      );
      documentcell.setStyle(style);
      var nodetitle = graph.insertVertex(
        documentcell,
        null,
        objtitle,
        0,
        0,
        this.documentcellwidth,
        this.titlecellheight
      );
      nodetitle.setStyle(this.titlecellstyle);
      nodetitle.setValue(titlename);
      nodetitle.natype = NASettings.Dictionary.ATTRIBUTTES.DOCTITLE;
      nodetitle.setConnectable(false);
      var nodedesc = graph.insertVertex(
        documentcell,
        null,
        objdescription,
        0,
        this.titlecellheight,
        this.documentcellwidth,
        this.documentcellheight - this.titlecellheight
      );
      nodedesc.setStyle(this.descriptioncellstyle);
      nodedesc.setValue(NASettings.Language.English["description"]);
      nodedesc.setConnectable(false);
      nodedesc.natype = NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION;
    } finally {
      graph.getModel().endUpdate();
    }

    return documentcell;
  };

  /**
   * Create document item cell for the Shape picker and Palette
   * @returns
   */
  createDocumentItem = function (entry) {
    var graph = new mxGraph();
    var documentcell = this.createDocumentItemCell(graph, entry); //there are two options, HTML Document or Simple label + description.
    //this.insertListenerHTMLDocumentItemDoubleClick(entry);  //disable double click window editor
    return {
      xml: NAUtil.ModelToXML(graph),
      graph: graph,
      cell: documentcell,
    };
  };
  /**
   * Create NA Panel Window
   * Default shape picker
   * Narrative Abduction Side Panel 
   * - Narrative View
   * - Common Menus
   */
  createNAPanel = function () {
    var container = document.createElement("div");
    var commonmenu = document.createElement("div");
    var narrativeview = document.createElement("div");

    container.classList.add(NASettings.CSSClasses.Panels.SidePanel);
    commonmenu.classList.add(NASettings.CSSClasses.Panels.CommonMenuContainer);
    this.panelwindow = container;
    this.panelwindow.commonmenu = commonmenu;
    this.panelwindow.narrativeview = narrativeview;

    this.editorui.sidebar.container.append(container);
    container.append(narrativeview);
    container.append(commonmenu);

    this.createCommonMenus();
    //This part contains some functions for development purposes
    //this.createDevToolPanel(container);
  };

  createCommonMenus = function(){
      var title = document.createElement("h3");
      title.innerHTML = "Common Menus";
      this.panelwindow.commonmenu.append(title);
      this.createUpdateLinksMenu();
      this.createLoadNarrativeMenu();
      //    
  }

  createLoadNarrativeMenu = function(){
    var container = document.createElement("div");
    var t = this;
    NAUtil.AddButton("Load narratives", container, function () {
      t.loadExistingNarratives();
    });

    this.createCommonMenu("Load existing narrative", container);
  }

  createCommonMenu = function(label, menucontainer){
      var container = document.createElement("div");
      var labelcontainer = document.createElement("div");
      labelcontainer.innerHTML = label;
      labelcontainer.classList.add(NASettings.CSSClasses.NarrativeListView.MenuLabel);
      container.append(labelcontainer);
      container.append(menucontainer);
      this.panelwindow.commonmenu.append(container);
  }

  createUpdateLinksMenu = function(){
    //This part is to add link type buttons 
    var setlinktypecontainer = document.createElement("div");
    //looping through naentries
    var t = this;
    this.naentries.forEach(function (element) {
      if (element.type == "edge") {
        NAUtil.AddButton(
          element.name.replace("Link", ""),
          setlinktypecontainer,
          function () {
            var selectedCells = t.editorui.editor.graph.getSelectionCells();
            if (selectedCells.length == 0) {
              alert("Select an edge");
              return;
            }
            console.log("Selection", selectedCells);
            selectedCells.forEach(function (selected) {
              console.log("Is Edege", selected.isEdge());
              if (selected.isEdge()) {
                var graph = t.editorui.editor.graph;
                graph.getModel().beginUpdate();
                try {
                  graph
                    .getModel()
                    .setValue(selected, element.name.replace("Link", "") + "s");
                  graph.setCellStyle(element.style, [selected]);
                } finally {
                  graph.getModel().endUpdate();
                }
              }
            });
          }
        );
      }
    });
    this.createCommonMenu("Update selected edge into", setlinktypecontainer);
  }

  /**
   * Create Dev tool panel on
   * @param {*} container
   */
  createDevToolPanel = function (container) {
    var devtoolcontainer = document.createElement("div");

    devtoolcontainer.style.border = "1px solid #aaa";
    var label = document.createElement("span");
    label.innerHTML = "Dev tool";
    devtoolcontainer.append(label);
    container.append(devtoolcontainer);

    var t = this;

    NAUtil.AddButton("Load narratives", devtoolcontainer, function () {
      t.loadExistingNarratives();
    });


    NAUtil.AddButton("Apply test layou all", devtoolcontainer, function () {
      t.narrativelayout.applyLayoutNarrativeCellsNaive();
      
    });


    // NAUtil.AddButton("Show model", devtoolcontainer, function () {
    //   console.log("Dev tool - show model", t.editorui.editor.graph.getModel());
    // });

    // NAUtil.AddButton("Show cells detail", devtoolcontainer, function () {
    //   console.log(
    //     "Dev tool - show model",
    //     t.editorui.editor.graph.getSelectionCells()
    //   );
    // });

    // NAUtil.AddButton("Select all", devtoolcontainer, function () {
    //   t.editorui.editor.graph.selectAll();
    // });


    // NAUtil.AddButton(
    //   "Test layout of Narrative 1",
    //   devtoolcontainer,
    //   function () {
    //     // Assuming you have the mxGraph instance and the graph model

    //     var graph = t.editorui.editor.graph;
    //     var model = graph.getModel();
    //     var narrative = t.narratives[0];
    //     if (!narrative) return;

    //     // Identify parent nodes and children (replace with your logic)
    //     var parentNodes = narrative.cells; // Array of parent node cells

    //     // check excluded nodes
    //     var excludeNodes = [];

    //     graph.selectAll();
    //     var selectedCells = graph.getSelectionCells();
    //     selectedCells.forEach((cell) => {
    //       if (!parentNodes.includes(cell) && cell.children != null) {
    //         excludeNodes.push({
    //           excell: cell,
    //           x: cell.geometry.x,
    //           y: cell.geometry.y,
    //         });
    //       }
    //     });

    //     console.log("excludeNodes", excludeNodes);

    //     //update excluded cells position
    //     model.beginUpdate();
    //     try {
    //       var layout = new mxHierarchicalLayout(graph);
    //       layout.execute(graph.getDefaultParent(), parentNodes);

    //       excludeNodes.forEach((cell) => {
    //         var currentgeometry = model.getGeometry(cell.excell);
    //         currentgeometry.x = cell.x;
    //         currentgeometry.y = cell.y;

    //         console.log("currentgeometry", currentgeometry);
    //         console.log("cell", cell);

    //         model.setGeometry(cell.excell, currentgeometry);
    //       });
    //     } finally {
    //       model.endUpdate();
    //     }
    //   }
    // );

    // /// add group
    // NAUtil.AddButton("Group nodes", devtoolcontainer, function () {
    //   console.log("Dev tool - group nodes", t.editorui.editor.graph.getModel());
    //   var graph = t.editorui.editor.graph;
    //   var cells = graph.getSelectionCells();
    //   graph.groupCells(null, 0, cells);
    // });

    // NAUtil.AddButton("Create narrative", devtoolcontainer, function () {
    //   console.log("Dev tool - group nodes", t.editorui.editor.graph.getModel());
    //   t.newNarrative();
    // });
  };

  /**
   * Create palette for the side bar
   */
  createPalette = function () {
    var entries = []; //all palette entries
    for (var i = 0; i < this.naentries.length; i++) {
      var res;
      if (this.isValidShapePickerItem(this.naentries[i])) {
        var entry = this.naentries[i];
        entry.titlename = NAUtil.GetCellChildrenLabels(
          this.naentries[i].name
        ).title;
        entry.descname = NAUtil.GetCellChildrenLabels(
          this.naentries[i].name
        ).description;

        res = this.createDocumentItem(entry);
        this.naentries[i].xml = res.xml;
        this.naentries[i].graph = res.graph;
        entries.push(
          this.editorui.sidebar.addDataEntry(
            this.naentries[i].name,
            0,
            0,
            this.naentries[i].name,
            Graph.compress(this.naentries[i].xml)
          )
        );
      }
      console.log("Entires", entries);
    }
    //else{
    //     res = this.createLinkItem(this.naentries[i].name, this.naentries[i].style);
    // }
    NAUtil.AddPalette(this.editorui.sidebar, "Narrative Abduction", entries);
  };

  /**
   * Create the container cell that will contain the narrative cells
   */
  createNarrativeListCell = function () {
    var entry = this.getEntryByName(NASettings.Dictionary.CELLS.NARRATIVELIST);
    var graph = this.editorui.editor.graph;
    var doc = mxUtils.createXmlDocument();
    var obj = doc.createElement(entry.name);

    console.log("entry", entry);
    graph.getModel().beginUpdate();
    try {
      var cell = graph.insertVertex(
        graph.getDefaultParent(),
        null,
        obj,
        0,
        0,
        100,
        100
      );
      cell.setStyle(entry.style);
      this.narrativelistcell = cell;
      console.log("cell", cell);
    } finally {
      graph.getModel().endUpdate();
    }
  };

  /**
   * Create narrativesviewer window/panel
   */
  createNarrativesView = () => {
    this.narrativeaviewscontainer = new NarrativeListViewContainer(
      NASettings.Colors.Narratives,
      this
    );  
    // add load narrative buttion
    // NAUtil.AddButton(NASettings.Language.English.loadnarratives, container, function(){
    //     t.loadExistingNarratives();
    //  });
  };

  /**
   * Remove narrative from the list
   * @param {*} narrative
   */
  deleteNarrative = function (narrative) {
    this.narratives.splice(this.narratives.indexOf(narrative), 1);
  };

  /**
   * Return the narrative entry
   */
  getNarrativeEntry = function () {
    var res = null;
    this.naentries.forEach(function (elem) {
      if (elem.name == NASettings.Dictionary.CELLS.NARRATIVE) {
        res = elem;
      }
    });
    return res;
  };

  getNarrativeCells = function (cells) {
    var nacells = [];
    cells.forEach((cell) => {
      if (Narrative.isCellNarrative(cell)) nacells.push(cell);
    });
    //not found, they might be inside the narrative list cell
    if (nacells.length == 0) {
      cells.forEach((cell) => {
        if (this.isCellNarrativeList(cell)) {
          console.log("Narrative list", cell);
          var children = cell.children;
          if (children) {
            children.forEach((child) => {
              if (Narrative.isCellNarrative(child)) nacells.push(child);
            });
          }
        }
      });
    }

    return nacells;
  };

  /**
   * Get value (label) of the narrative cell, check isCellNarrativeCell first
   * @param {*} cell 
   * @returns 
   */
  getNarrativeCellValue = function(cell){
    let val = "";
    let cellvalue =  this.editorui.editor.graph.model.getValue(cell);
    if (cellvalue != null) val = cellvalue.getAttribute('label');
    if(val == null) val = cellvalue.innerHTML;

    return val;
  }


  /**
   * Return the html content of the HTML Document Item
   * @param {*} title
   * @param {*} description
   * @returns
   */
  getHTMLDocumentItemContent = function (title, description) {
    return (
      '<div class="responsive-content"><b>' +
      title +
      "</b><br/><div>" +
      description +
      "</div></div>"
    );
  };

  getEntryByName = function (name) {
    var ent = null;
    this.naentries.forEach((element) => {
      if (element.name == name) {
        ent = element;
        return ent;
      }
    });

    return ent;
  };

  /**
   * Get the description cell child from a cell
   * @param {*} parentcell
   */
  getDescriptionCell = function (parentcell) {
    var res = null;
    if (parentcell.children) {
      parentcell.children.forEach((child) => {
        var natype = child.natype;
        if (natype == NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION) {
          res = child;
        }
      });
    }
    return res;
  };

  /**
   * Get the title cell from a cell
   * @param {*} parentcell
   * @returns
   */
  getTitleCell = function (parentcell) {
    var res = null;
    if (parentcell.children) {
      parentcell.children.forEach((child) => {
        var natype = child.natype;
        if (natype == NASettings.Dictionary.ATTRIBUTTES.DOCTITLE) {
          res = child;
        }
      });
    }
    return res;
  };

  getDescriptionCellContentHTML = function (descell) {
    return document.getElementById(descell.id + "-description");
  };

  /**
   * Get the height of the html description cell content
   */
  getDescriptionCellContentHeight = function (descell) {
    var res = null;
    if (descell) {
      //get html
      var html = document.getElementById(descell.id + "-description");
      if (html) {
        res = html.offsetHeight;
      }
    }
    return res;
  };

  /**
   * Hide Mode Shapes button on the Side bar
   */
  hideMoreShapesButton = function () {
    var buttons = document.getElementsByClassName("geSidebarFooter");
    console.log("Buttons", buttons);
    Array.from(buttons).forEach(function (elm) {
      console.log("Element", elm.innerHTML);
      if (elm.innerHTML.includes("More Shapes")) {
        elm.style.display = "none";
      }
    });
  };

  updateDescriptionHeightBasedOnContent = function (descell) {
    //get html
    var html = document.getElementById(descell.id + "-description");
    if (html) {
      console.log("html", html);
      console.log("html.height", html.getBoundingClientRect().height);
      console.log(" descell.geometry.height", descell.geometry.height);
      var height = html.offsetHeight;
      descell.geometry.height = height;
      console.log(" descell.geometry.height", descell.geometry.height);
    }
  };


  //#region listeners

  /**
   * Handler for when the vanila document item size is updated.
   * The requirement is that the height can't be manually adjusted. The height is adjusted based on the content of the description.
   */
  initListenerResponsiveSizeHandlerVanilaContent = function () {
    var graph = this.editorui.editor.graph;
    var t = this;
    // Handle resizing of the cell
    graph.addListener(mxEvent.RESIZE_CELLS, function (sender, evt) {
      console.log("evt", evt);
      var cells = evt.getProperty("cells");
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        console.log("Cell", cell);

        if(NarrativeAbductionApp.isCellDocumentItem(cell)){
            //the width can be manually adjusted, so the this be
            var newWidth = Math.max(cell.geometry.width, t.documentitemminwidth);
            cell.geometry.width = newWidth;

            //the height, however, is based on the height of the description cell.
            //the problem is, we need to wait until the HTML content inside the description cell to be updated before getting the final height.
            //thus, the height of the document item can only be adjusted after the next frame animation
            var descell = t.getDescriptionCell(cell);
            if (descell) {
            descell.geometry.width = newWidth;

            //now update the height according to the new height
            var htmlcontent = t.getDescriptionCellContentHTML(descell);

            requestAnimationFrame(() => {
                console.log("htmlcontent 2", htmlcontent);
                console.log("New height 2", htmlcontent.scrollHeight);
                var htmlheight = htmlcontent.clientHeight;
                console.log("htmlheight", htmlheight);
                htmlheight = (htmlheight > 0)? htmlheight: descell.geometry.height;
                descell.geometry.height = htmlheight;
                descell.geometry.y = t.titlecellheight;

                cell.geometry.height = htmlheight + t.titlecellheight;
                graph.refresh();
            });
            }

            var titlecell = t.getTitleCell(cell);
            if (titlecell) {
            titlecell.geometry.width = newWidth;
            }
        }
      }
    });
  };

  /**
   * Update the height of the document item to accomodate the description
   */
  initListenerDocumentSizeAfterDescriptionEdit = function () {
    var graph = this.editorui.editor.graph;
    graph.addListener(mxEvent.LABEL_CHANGED, function (sender, evt) {
      var cell = evt.getProperty("cell"); // Get the cell whose label changed
      var newValue = evt.getProperty("value"); // Get the new label value
      var natype = cell.natype;
      console.log("cell", cell);
      console.log("natype", natype);

      if(!cell.natype) return;

      if (natype == NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION) {
        console.log("cell", cell);
        console.log("new value", newValue);
        console.log("geometry", cell.geometry);
      }
    });
  };

  /**
   * Prevent editing with double click
   */
  initListenerEdgeDoubleClickEditHandler = function () {
    var graph = this.editorui.editor.graph;
    var t = this;
    graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
      //if edge, show Contextual Edge Option Menu
      var cell = evt.getProperty("cell");
      if (cell != null && cell.isEdge()) {
        var event = evt.getProperty("event");
        t.showContextualEdgeOptionMenu(cell, event.x, event.y);
      }
    });
  };

  /**
   * Show link type option when two nodes are connected. In the vanila version, the default link will be "Cause".
   */
  initListenerConnectionHandler = function () {
    var graph = this.editorui.editor.graph;
    var t = this;

    graph.connectionHandler.addListener(
      mxEvent.CONNECT,
      function (sender, evt) {
        var edge = evt.getProperty("cell");
        var source = graph.getModel().getTerminal(edge, true);
        var target = graph.getModel().getTerminal(edge, false);
        var event = evt.getProperty("event");

        console.log("Connected");
        console.log("Source", source);
        console.log("Target", target);
        console.log("evt", evt);

        //t.showContextualEdgeOptionMenu(edge, event.x, event.y); //no contextual menu by default
        //by default the link will be causes link
        t.setEdgeType(edge, NASettings.Dictionary.CELLS.CAUSELINK);
      }
    );
  };

  /**
   * Remove cell handler
   */
  initListenerRemoveNarrativeCellHandler = function () {
    var graph = this.editorui.editor.graph;
    var t = this;

    graph.addListener(mxEvent.CELLS_REMOVED, function (sender, evt) {
      var cells = evt.getProperty("cells");
      console.log("Cell removed", cells[0]);
      cells.forEach((cell) => {
        //if the cell is narrative, remove the view as well
        if (Narrative.isCellNarrative(cell)) {
          console.log("Narrative removed", cell);
          t.narrativeaviewscontainer.removeListView(cell);
        }
      });
    });
  };

  /**
   * Shape-picker override to show NA cells
   */
  initOverrideShapePickerHandler = function () {
    //override
    var t = this;
    this.editorui.getCellsForShapePicker = function (
      cell,
      hovering,
      showEdges
    ) {
      //somehow the style fails, we need to override it. This might not be the case anymore, need to revisit this again later
      var newcells = [];
      t.naentries.forEach(function (currentValue, index, arr) {
        console.log("c", currentValue);
        //only add node items
        if (t.isValidShapePickerItem(currentValue)) {
          var cell = NAUtil.GetCellByNodeName(
            currentValue.graph,
            currentValue.name
          );
          var g = currentValue.graph;
          g.getModel().setStyle(cell, currentValue.style);
          newcells.push(cell);
        }
      });
      console.log("Shape-picker new cells", newcells);
      return newcells;
    };
  };


  /**
   * Override label presentation of the narrative document items
   */
  initOverrideConvertValueString = function () {
    var graph = this.editorui.editor.graph;
    var t = this;
    graph.convertValueToString = function (cell) {
        //console.log("initOverrideConvertValueString cell", cell);
      //if the cell is document item, return empty string
      if (NarrativeAbductionApp.isCellDocumentItem(cell)) {
        return "";
      } else if (t.isCellNarrativeCell(cell)){
        //console.log("Narrative");
        let val = t.getNarrativeCellValue(cell);
       // console.log("val", val);
 
        return val;        
    } else {
        //check title or description
        if (cell.natype) {
          switch (cell.natype) {
            case NASettings.Dictionary.ATTRIBUTTES.DOCTITLE:
              var value = cell.value;
              var htmlvalue =
                "<div id ='" +
                cell.id +
                "-title' style='" +
                t.titlecellcontenthmtlstyle +
                "'><h3>" +
                value +
                "</h3></div>";
              return htmlvalue;
              break;
            case NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION:
              var value = cell.value;
              var htmlvalue =
                "<div id ='" +
                cell.id +
                "-description' style='" +
                t.descriptioncellcontenthtmlstyle +
                "'>" +
                value +
                "</div>";
              return htmlvalue;
              break;
            default:
                if (cell.value != null) {
                    // Here, you can customize how the cell's value is displayed as a string
                    return cell.value.toString(); // Example: Convert the value to a string
                  } else {
                    return ''; // Return an empty string if the value is null or undefined
                }
          }
        } else {
            if (cell.value != null) {
                // Here, you can customize how the cell's value is displayed as a string
                return cell.value.toString(); // Example: Convert the value to a string
              } else {
                return ''; // Return an empty string if the value is null or undefined
            }
        }
      }
    };
  };

  /**
   * Is the cell a document item
   * @param {*} cell 
   * @returns 
   */
  static isCellDocumentItem = function(cell){
    return (cell.getAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE));
  }

  isCellNarrativeCell = function(cell){
    if(cell.value && cell.value.nodeName == NASettings.Dictionary.CELLS.NARRATIVE){
        return true;
    }else{
        return false;
    }
  }

  /**
   * Trigger custom functions everytime a new cell is added
   */
  initOverrrideNewCellHandler = function () {
    var graph = this.editorui.editor.graph;
    var t = this;
    graph.addListener(mxEvent.CELLS_ADDED, function (sender, evt) {
      //if edge, show Contextual Edge Option Menu
      var cells = evt.getProperty("cells");
      console.log("new cells", cells);
      var newCell = cells[0];
      if (newCell && newCell.isEdge()) {
        //edge type based on target node
        var edge = newCell;
        var targetType = edge.target.value.getAttribute(
          NASettings.Dictionary.ATTRIBUTTES.NATYPE
        );
        switch (targetType) {
          case NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE:
            t.setEdgeType(edge, NASettings.Dictionary.CELLS.EXPLAINLINK);
            break;
          default:
            t.setEdgeType(edge, NASettings.Dictionary.CELLS.CAUSELINK);
            break;
        }
        //if the source cell is narrative item and source cell is part of a narrative, make the cell part of the same narrative
        var source = edge.source;
        var target = edge.target;
        console.log(source, "source");
        var sourceNarrative = t.getDocumentItemNarrative(source);
        console.log("sourceNarrative", sourceNarrative);

        if(sourceNarrative){
            var naListVIew = t.narrativeaviewscontainer.getListViewByNarrative(sourceNarrative);
            console.log("naListVIew", naListVIew);

            if(naListVIew){
              naListVIew.assignNodes([target]);
            }
        }
        
        // t.showContextualEdgeOptionMenu(cells[0] , sender.lastMouseX, sender.lastMouseY);
      }
      //if the cell is Narrative, trigger create a new narrative action
      if (
        newCell.getAttribute(NASettings.Dictionary.ATTRIBUTTES.NATYPE) ==
        NASettings.Dictionary.CELLS.NARRATIVE
      ) {
        graph.removeCells([newCell]);
        t.newNarrative();
      }
     
    });
  };

  /**
   * Get a narrative that has the cell
   * @param {*} cell 
   * @returns 
   */
  getDocumentItemNarrative = function(cell){
    var na;
    this.narratives.forEach(narrative => {
        if(narrative.cells.includes(cell)){
          na = narrative;        
        }
    });
    return na;
  }

  //#endregion

  /**
   * Update graph model base on LOD if specified
   */
  initOverrideLODUpdate = function () {
    // Links level of detail to zoom level but can be independent of zoom
    var t = this;
    this.editorui.editor.graph.isCellVisible = function (cell) {
      //  console.log("Zooming", t.editorui.editor.graph.view.scale);
      //  console.log("Cell LOD", cell.lod);
      return (
        cell.lod == null || cell.lod / 2 < t.editorui.editor.graph.view.scale
      );
    };
  };

  isCellNarrativeList = function (cell) {
    return (
      cell.value &&
      cell.value.tagName &&
      cell.value.tagName == NASettings.Dictionary.CELLS.NARRATIVELIST
    );
  };

  /**
   * check whether or not the entry should be included in the shape picker
   * @param {*} entry
   * @returns
   */
  isValidShapePickerItem = function (entry) {
    return entry.type == "node" && !this.excludefrompicker.includes(entry.name);
  };

  /**
   * This is the listener to the new HTML document item, lots of duplicates with insertListenerDocumentItemDoubleClick
   * TODO: remove duplicates
   * @param {*} entry
   */
  insertListenerHTMLDocumentItemDoubleClick = function (entry) {
    var currgraph = this.editorui.editor.graph;
    var t = this;
    // Add on click listener to show the Narrative Item window
    NAUtil.AddNodeDoubleClickListener(
      currgraph,
      entry.name,
      function (cell, evt) {
        if (!cell || !cell.children) return;

        var contentcell = cell.children[0].value;

        // get x and y position of triggered event
        var x = evt.getProperty("event").x;
        var y = evt.getProperty("event").y;

        // create form
        var formContainer = document.createElement("div");
        formContainer.style.width = "150px";
        formContainer.style.padding = "20px";

        const form = document.createElement("form");
        form.id = "narrativeitemform";

        const nameLabel = document.createElement("label");
        nameLabel.textContent = "Name:";
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.id = "name";
        nameInput.name = "name";
        nameInput.required = true;
        nameInput.value = cell.getAttribute(
          NASettings.Dictionary.ATTRIBUTTES.DOCTITLE
        );

        const br = document.createElement("br");

        const descriptionLabel = document.createElement("label");
        descriptionLabel.textContent = "Description:";
        const descriptionTextarea = document.createElement("textarea");
        descriptionTextarea.id = "description";
        descriptionTextarea.name = "description";
        descriptionTextarea.rows = 4;
        descriptionTextarea.cols = 30;
        descriptionTextarea.value = cell.getAttribute(
          NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION
        );

        const applyButton = document.createElement("button");
        applyButton.id = "applyButton";
        applyButton.type = "button";
        applyButton.textContent = "Apply";
        applyButton.onclick = applyForm(currgraph, cell, t);

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
        var highlight = new mxCellHighlight(currgraph, "#000", 2);
        formContainer.onmouseenter = function () {
          highlight.highlight(currgraph.view.getState(cell));
        };
        formContainer.onmouseleave = function () {
          highlight.hide();
        };

        var wnd = NAUtil.CreateWindow(
          NASettings.Dictionary.UI.DOCUMENTITEMWINDOW,
          NASettings.Dictionary.UI.DOCUMENTITEMWINDOW,
          formContainer,
          x,
          y,
          250,
          200
        );

        wnd.setLocation(x, y);
        wnd.setClosable(true);
        wnd.setMinimizable(false);
        wnd.setVisible(true);

        form.onsubmit = function (event) {
          event.preventDefault();
          return false;
        };

        function applyForm(currgraph, c, t, n, d) {
          return function () {
            const nameInput = document.getElementById("name");
            const descriptionTextarea = document.getElementById("description");

            currgraph.getModel().beginUpdate();
            try {
              var html = t.getHTMLDocumentItemContent(
                nameInput.value,
                descriptionTextarea.value
              );
              var contentcell = c.children[0];

              currgraph.model.setValue(contentcell, html);
              cell.setAttribute(
                NASettings.Dictionary.ATTRIBUTTES.DOCTITLE,
                nameInput.value
              );
              cell.setAttribute(
                NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION,
                descriptionTextarea.value
              );
            } finally {
              currgraph.getModel().endUpdate();
            }
            wnd.destroy();
            highlight.hide();
          };
        }
      }
    );
  };

  /**
   * This is listener for the old document item with dedicated nodes for the title and description. Lots of duplicated codes with insertListenerHTMLDocumentItemDoubleClick.
   * TODO: remove duplicates
   * @param {*} entry
   */
  insertListenerDocumentItemDoubleClick = function (entry) {
    var currgraph = this.editorui.editor.graph;
    // Add on click listener to show the Narrative Item window
    NAUtil.AddNodeDoubleClickListener(
      currgraph,
      entry.name,
      function (cell, evt) {
        if (!cell || !cell.children) return;

        var cellName = cell.children[0].value;
        var cellDesc = cell.children[1].value;

        var x = evt.getProperty("event").x;
        var y = evt.getProperty("event").y;

        var formContainer = document.createElement("div");
        formContainer.style.width = "150px";
        formContainer.style.padding = "20px";

        const form = document.createElement("form");
        form.id = "narrativeitemform";

        const nameLabel = document.createElement("label");
        nameLabel.textContent = "Name:";
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.id = "name";
        nameInput.name = "name";
        nameInput.required = true;
        nameInput.value = cellName;

        const br = document.createElement("br");

        const descriptionLabel = document.createElement("label");
        descriptionLabel.textContent = "Description:";
        const descriptionTextarea = document.createElement("textarea");
        descriptionTextarea.id = "description";
        descriptionTextarea.name = "description";
        descriptionTextarea.rows = 4;
        descriptionTextarea.cols = 30;
        descriptionTextarea.value = cellDesc;

        const applyButton = document.createElement("button");
        applyButton.id = "applyButton";
        applyButton.type = "button";
        applyButton.textContent = "Apply";
        applyButton.onclick = applyForm(currgraph, cell);

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
        var highlight = new mxCellHighlight(currgraph, "#000", 2);
        formContainer.onmouseenter = function () {
          highlight.highlight(currgraph.view.getState(cell));
        };
        formContainer.onmouseleave = function () {
          highlight.hide();
        };

        var wnd = NAUtil.CreateWindow(
          NASettings.Dictionary.UI.DOCUMENTITEMWINDOW,
          NASettings.Dictionary.UI.DOCUMENTITEMWINDOW,
          formContainer,
          x,
          y,
          250,
          200
        );

        wnd.setLocation(x, y);
        wnd.setClosable(true);
        wnd.setMinimizable(false);
        wnd.setVisible(true);

        // const nameInput = document.getElementById("name");
        // nameInput.value = cellName;
        // const descriptionTextarea = document.getElementById("description");
        // descriptionTextarea.value = cellDesc;
        // const applyButton = document.getElementById("applyButton");
        // applyButton.onclick = applyForm(currgraph, cell);
        // const form = document.getElementById("narrativeitemform");
        form.onsubmit = function (event) {
          event.preventDefault();
          return false;
        };

        function applyForm(currgraph, c, n, d) {
          return function () {
            const nameInput = document.getElementById("name");
            const descriptionTextarea = document.getElementById("description");

            console.log("Graph", currgraph);
            console.log("Cell", c);

            console.log("Name", n);
            console.log("Des", d);

            currgraph.getModel().beginUpdate();
            try {
              currgraph.model.setValue(c.children[0], nameInput.value);
              currgraph.model.setValue(
                c.children[1],
                descriptionTextarea.value
              );
            } finally {
              currgraph.getModel().endUpdate();
            }
            console.log("Cell", c);
            wnd.destroy();
            highlight.hide();
          };
        }
      }
    );
  };

  /**
   * Check for existing narrative cells and update the view accordingly
   */
  loadExistingNarratives = function () {
    var t = this;
    var graph = t.editorui.editor.graph;

    t.editorui.editor.graph.selectAll();
    var cells = graph.getSelectionCells();
    console.log("Cells", cells);

    var nacells = this.getNarrativeCells(cells);
    console.log("nacells", nacells);

    nacells.forEach((cell) => {
      if (Narrative.isCellNarrative(cell)) {
        console.log("loadExistingNarratives", cell);
        let val = t.getNarrativeCellValue(cell);
        if(val == "") val = NASettings.Language.English.newnarrative;
        var na = new Narrative(
          cell,
          graph,
          val,
          cell.id
        );
        this.narratives.push(na);
        var nalistview = this.narrativeaviewscontainer.addNarrativeListView(
          na,
          cell,
          this
        ); //add accordion view

        //then, we need to re-assign cells to this narrative. These cells ids are store in the cells proprty
        var cellstring = cell.getAttribute(
          NASettings.Dictionary.ATTRIBUTTES.NARRATIVECELLS
        );
        var cellsidsarray = Narrative.stringCellsToArray(cellstring);
        var cellsarray = [];
        cellsidsarray.forEach((id) => {
          var cell = graph.getModel().getCell(id);
          if (cell) cellsarray.push(cell);
        });
        console.log("cellsarray", cellsarray);
        nalistview.assignNodes(cellsarray);
      }
    });
    t.editorui.editor.graph.removeSelectionCells(cells);
  };

  /**
   * Create a new narrative, trigger create narrative view and narrative cell
   */
  newNarrative = function () {
    var narrativeentry = this.getNarrativeEntry(); //get narrative entry from the entries list
    var graph = this.editorui.editor.graph;
    var parent = graph.getDefaultParent();
    var doc = mxUtils.createXmlDocument();
    var objna = doc.createElement(narrativeentry.name);

    var narrativecell;
    var narrview;
    var na;
    graph.getModel().beginUpdate();
    //add the narrative cell
    try {
      narrativecell = graph.insertVertex(parent, null, objna, 0, 0, 100, 100);
      narrativecell.value.setAttribute('label', NASettings.Language.English.newnarrative);
      graph.setCellStyle(narrativeentry.style, [narrativecell]);
    } finally {
      graph.getModel().endUpdate();
      //create narrative object and view
      na = new Narrative(
        narrativecell,
        graph,
        NASettings.Language.English.newnarrative,
        narrativecell.id
      );
      this.narratives.push(na);
      console.log("naabduction", this);
      narrview = this.narrativeaviewscontainer.addNarrativeListView(
        na,
        narrativecell,
        this
      ); //add accordion view

      //trigger new narrative event
      this.#event = new CustomEvent(NASettings.Dictionary.EVENTS.NEWNARRATIVE, {
        detail: {
          narrative: na,
          narrativecell: narrativecell,
        },
      });
      dispatchEvent(this.#event);

      //if objects are selected, add them automatically to the narrative
      var selectedCells = graph.getSelectionCells();
      if (selectedCells && narrview) {
        narrview.assignNodes(selectedCells);
      }
    }


    //update layout
    this.narrativelayout.updateLayout();

    return {
      narrative: na,
      narrativeview: narrview,
      narrativecell: narrativecell,
    };
  };

  /**
   * Take the edge and turn it into Cause link
   * @param {*} edge
   */
  setEdgeType = function (edge, target) {
    var graph = this.editorui.editor.graph;
    var causeLink = this.getEntryByName(target);
    if (causeLink) {
      graph.getModel().beginUpdate();
      try {
        graph.getModel().setValue(edge, target.replace("Link", "") + "s");
        graph.setCellStyle(causeLink.style, [edge]);
      } finally {
        graph.getModel().endUpdate();
      }
    }
  };

  /**
   * Show edge type options at position x and y
   * @param {*} edge
   * @param {*} x
   * @param {*} y
   */
  showContextualEdgeOptionMenu = function (edge, x, y) {
    var container = document.createElement("div");
    var window = new mxWindow("EdgeType", container, x, y, 200, 200);

    var t = this;
    this.naentries.forEach(function (element) {
      if (element.type == "edge") {
        NAUtil.AddButton(
          element.name.replace("Link", ""),
          container,
          function () {
            var graph = t.editorui.editor.graph;
            graph.getModel().beginUpdate();
            try {
              graph
                .getModel()
                .setValue(edge, element.name.replace("Link", "") + "s");
              graph.setCellStyle(element.style, [edge]);
            } finally {
              graph.getModel().endUpdate();
            }
            window.destroy();
          }
        );
      }
    });

    window.setMinimizable(false);
    window.setClosable(true);
    window.setVisible(true);
  };

  /**
   * This function decides how the content of the HTML Document Item is rendered to HTML element. This function is related to the HTML Document Item format.
   * @param {*} contencell
   */
  updateHTMLDocumentItemAppearance = function (doccell, contencell) {
    var title = doccell.getAttribute(
      NASettings.Dictionary.ATTRIBUTTES.DOCTITLE
    );
    var des = doccell.getAttribute(
      NASettings.Dictionary.ATTRIBUTTES.DOCDESCRIPTION
    );
    var html = this.getHTMLDocumentItemContent(title, des);
    contencell.setValue(html);
  };

  /**
   * Update position of more shape button
   */
  updateMoreShapesButton = function () {
    var buttons = document.getElementsByClassName("geSidebarFooter");
    console.log("Buttons", buttons);
    var t = this;
    Array.from(buttons).forEach(function (elm) {
      console.log("Element", elm.innerHTML);
      if (elm.innerHTML.includes("More Shapes")) {
        elm.style.position = "relative";
        t.panelwindow.append(elm);
      }
    });
  };
}

