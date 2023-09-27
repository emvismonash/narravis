class NASettings {
    //base on https://docs.google.com/document/d/1FByhhJe67pJC6fPdE3lo8lgM6NN7K0_Uivf6n5Io9UE/edit
    static Dictionary = {
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
      ATTRIBUTTES: {
        NATYPE: "natype",
        DOCTITLE: "doctitle",
        DOCDESCRIPTION: "docdescription",
        NARRATIVECELLS: "cells",
      },
      UI: {
        NAHTMLCONTENT: "HTMLDocContent",
        DOCUMENTITEMWINDOW: "DocumentItemWindow",
      },
      EVENTS: {
        NEWNARRATIVE: "newnarrative",
        DELETENARRATIVE: "deletenarrative",
      },
    };
    static Language = {
      English: {
        newnarrative: "New Narrative",
        loadnarratives: "Load Narratives",
        assign: "Assign",
        unassign: "Unassign",
        description: "Description",
      },
    };
    static Colors = {
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
    };
    static Styles = {
      NarrativeBound: "connectable=0;editable=1;moveable=0;movable=0;resizable=0;rotatable=0;deletable=0;locked=0;recursiveResize=0;expand=0;cloneable=0;allowArrows=0;strokeColor=#808080;dashed=1;dashPattern=12 12;fillColor=none;"
    }
    static CSSClasses = {
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
        CellViewUIContainer: "nalv-cellviewuicontainer",
      },
      Panels: {
        SidePanel: "naSidePanel",
      },
      NAUtils: {
        Button: "naUtilButton",
      },
    };
  }
  
  