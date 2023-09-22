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
  
  