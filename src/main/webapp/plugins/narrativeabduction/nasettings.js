const NASettings = {
  DocumentCellSetting: {
    minwidth: 260,
    minheight: 90,
  },  
  Dictionary: {
    CELLS: {
      NARRATIVELIST: "NarrativeList",
      NARRATIVE: "Narrative",
      NARRATIVEITEM: "NarrativeItem",
      NARRATIVEEVIDENCECORE: "NarrativeEvidenceCore",
      JOINTCAUSE: "JointCause",
      EVIDENCENARRATIVESPECIFIC: "EvidenceNarrativeSpecific",
      SUPPORTINGARGUMENT: "SupportingArgument",
      NARRATIVESET: "NarrativeSet",
      EVIDENCEITEM: "EvidenceItem",
      EXPLAINLINK: "ExplainLink",
      CAUSELINK: "CauseLink",
      TRIGGERLINK: "TriggerLink",
      ENABLELINK: "EnableLink",
      SUPPORTLINK: "SupportLink",
      MOTIVATELINK: "MotivateLink",
      CONFLICTLINK: "ConflictLink",
    },
    ATTRIBUTES: {
      NATYPE: "natype",
      DOCTITLE: "doctitle",
      DOCDESCRIPTION: "docdescription",
      NARRATIVECELLS: "cells",
      NARRATIVECELLSBOUND: "narrativecellsbound",
      SWIMLANELABEL: "swimlanelabel",
      SWIMLANEINDICATOR: "swimlaneindicator"
    },
    UI: {
      NAHTMLCONTENT: "HTMLDocContent",
      DOCUMENTITEMWINDOW: "DocumentItemWindow",
    },
    EVENTS: {
      NEWNARRATIVE: "newnarrative",
      DELETENARRATIVE: "deletenarrative",
      NEWDOCUMENTITEM: "newdocumentitem",
      INSERTJSON2DIAGRAM: "insertjson2diagram", 
      JSON2ITEM: "json2item",
      JSON2ITEMDONE: "json2itemdone",
      JSON2ITEMSTART: "json2itemstart",
      LANELAYOUTUPDATED: "lanelayoutupdated"
    },
  },
  Language: {
    English: {
      newnarrative: "New Group",
      loadnarratives: "Load Narratives",
      assign: "Assign",
      unassign: "Unassign",
      description: "Description",
    },
  },
  Colors: {
    Narratives: [
      "#a6cee3",
      "#1f78b4",
      "#b2df8a",
      "#33a02c",
      "#fb9a99",
      "#e31a1c",
      "#fdbf6f",
      "#ff7f00",
      "#cab2d6",
    ],
  },
  Styles: {
    NarrativeBound: "connectable=0;editable=1;moveable=0;movable=0;resizable=0;rotatable=0;deletable=0;locked=0;recursiveResize=0;expand=0;cloneable=0;allowArrows=0;strokeColor=#E6E6E6;dashed=1;fillColor=none;strokeWidth=2;perimeterSpacing=3;"
  },
  CSSClasses: {
    NarrativeListView: {
      NodeContainer: "nalv-nodecontainer",
      Container: "nalv-container",
      HeadContainer: "nalv-headcontainer",
      HeadTopPart: "nalv-headtoppart",
      HeadBottomPart: "nalv-headbottompar",
      BodyContainer: "nalv-bodycontainer",
      Title: "nalv-title",
      ToggleButton: "nalv-togglebutton",
      CellViewContainer: "nalv-cellviewcontainer",
      CellViewTitle: "nalv-cellviewtitle",
      CellViewUnassignButton: "nalv-cellviewunassignbutton",
      CellViewUIContainer: "nalv-cellviewuicontainer"
    },
    NarrativeListViewContainer: {
      NarrativeViewContainer: "nalvc-container",
      NarrativeViewContainerMenu: "nalv-menucontainer",
      MenuLabel: "nalv-menulabel"
    },
    Panels: {
      SidePanel: "naSidePanel",
      CommonMenuContainer: "na-commonmenucontainer"
    },
    NAUtils: {
      Button: "naUtilButton",
    },
  }
}

const NAEntries = [
  {
    name: NASettings.Dictionary.CELLS.NARRATIVELIST,
    style:
      "swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=26;fillColor=none;horizontalStack=0;connectable=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;",
    type: "node",
  },
  {
    name: NASettings.Dictionary.CELLS.NARRATIVE,
    style:
      "text;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=24;connectable=0;",
    type: "node",
  },
  {
    name: NASettings.Dictionary.CELLS.NARRATIVEITEM,
    style:
      "html=1;absoluteArcSize=1;editable=1;rounded=1;whiteSpace=wrap;fontColor=#333333;strokeColor=default;autosize=1;resizeHeight=0;resizeWidth=1;fixedWidth=1;",
    type: "node",
  },
  {
    name: NASettings.Dictionary.CELLS.NARRATIVEEVIDENCECORE,
    style: "editable=1;rounded=0;whiteSpace=wrap;html=1;autosize=1;resizeHeight=0;resizeWidth=1;fixedWidth=1;",
    type: "node",
  },
  {
    name: NASettings.Dictionary.CELLS.EXPLAINLINK,
    style: "editable=1;endArrow=classic;html=1;rounded=0;strokeWidth=3;strokeColor=#00CC00;snapToPoint=1;",
    type: "edge",
  },
  {
    name: NASettings.Dictionary.CELLS.CAUSELINK,
    style: "editable=1;endArrow=classic;html=1;rounded=1;strokeWidth=3;snapToPoint=1;",
    type: "edge",
  },
  {
    name: NASettings.Dictionary.CELLS.TRIGGERLINK,
    style:
      "editable=0;endArrow=classic;html=1;rounded=1;strokeWidth=3;dashed=1;snapToPoint=1;",
    type: "edge",
  },
  {
    name: NASettings.Dictionary.CELLS.ENABLELINK,
    style:
      "editable=0;endArrow=classic;html=1;rounded=0;strokeWidth=3;dashed=1;dashPattern=1 1;strokeColor=#FF3333;snapToPoint=1;",
    type: "edge",
  },
  {
    name: NASettings.Dictionary.CELLS.SUPPORTLINK,
    style:
      "editable=0;endArrow=classic;html=1;rounded=0;strokeWidth=3;strokeColor=#006600;snapToPoint=1;",
    type: "edge",
  },
  {
    name: NASettings.Dictionary.CELLS.MOTIVATELINK,
    style: "editable=0;shape=flexArrow;endArrow=classic;html=1;rounded=0;snapToPoint=1;",
    type: "edge",
  },
  {
    name: NASettings.Dictionary.CELLS.CONFLICTLINK,
    style:
      "editable=0;editable=1;endArrow=cross;html=1;rounded=0;movable=1;resizable=1;rotatable=1;deletable=1;locked=0;connectable=1;startArrow=none;startFill=0;endFill=0;strokeWidth=2;strokeColor=#ff0000;snapToPoint=1;",
    type: "edge",
  },
]

const NAExamples =[
  {
      title: "Saki Airfield Explosion",
      description: "Narrative of Saki airforce field explosion [Human authored].",
      drawiofilepath: "plugins/narrativeabduction/examples/saki.drawio"
  },
  {
      title: "Three Little Pigs",
      description: "Competing narratives of three little pigs story [GPT authored]",
      drawiofilepath: "plugins/narrativeabduction/examples/threepigs.drawio"
  },
  {
      title: "Istanbul Explosion (Hypothetical)",
      description: "Hypothetical narratives of an explosion in Istanbul [GPT authored]",
      drawiofilepath: "plugins/narrativeabduction/examples/istanbulexplosion.drawio"
  },            
]