/**
 * The container object of all narrative accordion views
 */
class NarrativeListViewContainer {
    constructor(colors, app) {
      this.narrativealistviews = [];
      this.app = app;
      this.colors = colors;
      this.container;
      this.listcontainer;

      /**
       * Container 
       *  - Menu container
       *  - List container
       */
      var menucontainer = document.createElement("div");
      var listcontainer = document.createElement("div");
      var container = document.createElement("div");    
      listcontainer.id = "naListContainer";
      container.append(menucontainer);
      container.append(listcontainer);
      container.classList.add(NASettings.CSSClasses.Panels.SidePanel);
      this.app.editorui.sidebar.container.append(container);
      this.container = container;
      this.menucontainer = menucontainer;
      this.listcontainer = listcontainer;

          // add create narrative buttion
      var t = this;
      NAUtil.AddButton(NASettings.Language.English.newnarrative, this.menucontainer, () => {
        t.app.newNarrative();
      });
      

    }
  
    /**
     * Remove view from the list
     * @param {*} narrative
     */
    removeListView = function (narrativecell) {
      var listView = this.getListViewByNarrative(narrativecell);
      if (listView) {
        listView.narrative.deleteBound();
        listView.unhighlightCells(listView.narrative.cells); // unhighligth cells
        listView.remove(); //remove the view
        this.colors.push(listView.color); //return the color
      }
      this.narrativealistviews.splice(
        this.narrativealistviews.indexOf(listView),
        1
      ); //update the list
      this.app.deleteNarrative(narrativecell); //delete the narrative object
    };
  
    
    /**
     * Get the view by narrative
     * @param {*} narrative
     */
    getListViewByNarrative = function (narrative) {
      var ret = null;
      this.narrativealistviews.forEach((element) => {
        if (element.narrative.id == narrative.id) {
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
      this.narrativealistviews.push(naaccview);
  
      return naaccview;
    };
  
    /**
     * Get new color
     */
    getColor = function () {
      return this.colors.pop();
    };


    updateViewsOrder = function(){
      this.narrativealistviews
    }

    moveUp = function(narrative){
      var listView = this.getListViewByNarrative(narrative);
      console.log("this.narrativealistviews", this.narrativealistviews);
      var currentIdx = this.narrativealistviews.indexOf(listView);
      var targetIdx = currentIdx - 1;        
      if(this.narrativealistviews[targetIdx]){
        this.swapElementsPositions(listView, this.narrativealistviews[targetIdx]);
        this.app.narrativelayout.updateLayout([narrative, this.narrativealistviews[targetIdx].narrative]);
      }
    }

    moveDown = function(narrative){
      var listView = this.getListViewByNarrative(narrative);
      console.log("this.narrativealistviews", this.narrativealistviews);
      var currentIdx = this.narrativealistviews.indexOf(listView);
      var targetIdx = currentIdx + 1;        

      if(this.narrativealistviews[targetIdx]){
        this.swapElementsPositions(this.narrativealistviews[targetIdx], listView);
        this.app.narrativelayout.updateLayout([narrative, this.narrativealistviews[targetIdx].narrative]);
      }    
    }
    

   swapElementsPositions = function(firstlistview, secondlistview) {
      //swap views
      var firstElm = firstlistview.container;
      var secondElm = secondlistview.container;
      firstElm.parentNode.insertBefore(firstElm, secondElm);
      //swap array
      var tmp = firstlistview;
      var firstIdx = this.narrativealistviews.indexOf(firstlistview);
      var secondIdx = this.narrativealistviews.indexOf(secondlistview);
      this.narrativealistviews[firstIdx] = secondlistview;
      this.narrativealistviews[secondIdx] = tmp;
  }

}
  