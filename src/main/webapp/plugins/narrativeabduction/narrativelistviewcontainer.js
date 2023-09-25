/**
 * The container object of all narrative accordion views
 */
class NarrativeListViewContainer {
    constructor(colors) {
      this.narrativealistviews = [];
      this.app;
      this.colors = colors;
    }
  
    /**
     * Remove view from the list
     * @param {*} narrative
     */
    removeListView = function (narrative) {
      var listView = this.getListViewByNarrative(narrative);
      if (listView) {
        listView.remove(); //remove the view
        this.colors.push(listView.color); //return the color
      }
      this.narrativealistviews.splice(
        this.narrativealistviews.indexOf(listView),
        1
      ); //update the list
      this.app.deleteNarrative(narrative); //delete the narrative object
    };
  
    /**
     * Get the view by narrative
     * @param {*} narrative
     */
    getListViewByNarrative = function (narrative) {
      var ret = null;
      this.narrativealistviews.forEach((element) => {
        console.log("Narrative id", narrative.id);
        if (element.narrative.id == narrative.id) {
          console.log("Found");
          console.log(element);
          ret = element;
        }
      });
      return ret;
    };
  
    /**
     * Add view to the list
     * @param {*} na
     * @param {*} narrativecell
     */
    addNarrativeListView = function (narrative, narrativecell, naabduction) {
      //container of the narrative view
      var container = document.createElement("div");
      container.id = narrativecell.id;
      container.setAttribute("draggable", true);
  
      this.listcontainer.append(container);
      var color = this.getColor();
      var naaccview = new NarrativeListView(
        narrative,
        container,
        this.app.editorui,
        color,
        naabduction
      ); //create view
      naaccview.updateView();
      naaccview.cell = narrativecell;
      console.log("naabduction", naabduction);
      
      this.narrativealistviews.push(naaccview);
  
      return naaccview;
    };
  
    /**
     * Get new color
     */
    getColor = function () {
      return this.colors.pop();
    };
  }
  