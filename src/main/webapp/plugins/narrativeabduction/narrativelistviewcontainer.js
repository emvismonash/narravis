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
       * - Title
       *  - Menu container
       *  - List container
       */
      let title = document.createElement("h3");
      title.innerHTML = "NA View";
      let menucontainer = document.createElement("div");
      let listcontainer = document.createElement("div");
      let container = document.createElement("div");    
      container.classList.add(NASettings.CSSClasses.NarrativeListViewContainer.NarrativeViewContainer);
      menucontainer.classList.add(NASettings.CSSClasses.NarrativeListViewContainer.NarrativeViewContainerMenu);

      listcontainer.id = "naListContainer";
      container.append(title);
      container.append(menucontainer);
      container.append(listcontainer);
      
      this.app.panelwindow.narrativeview.append(container);
      this.container = container;
      this.menucontainer = menucontainer;
      this.listcontainer = listcontainer;

          // add create narrative buttion
      let t = this;
      NAUtil.AddButton(NASettings.Language.English.newnarrative, this.menucontainer, () => {
        t.app.newNarrative();
      });
      

    }
  
    /**
     * Remove view from the list
     * @param {*} narrative
     */
    removeListView(narrativecell) {
      let listView = this.getListViewByNarrative(narrativecell);
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
    getListViewByNarrative(narrative) {
      let ret = null;
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
    addNarrativeListView(narrative, narrativecell, naabduction) {
      //container of the narrative view
      let container = document.createElement("div");
      container.id = narrativecell.id;
      container.setAttribute("draggable", true);
  
      this.listcontainer.append(container);
      let color = this.getColor();
      let naaccview = new NarrativeListView(
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
    getColor() {
      return this.colors.pop();
    };


    updateViewsOrder = function(){
      this.narrativealistviews
    }

    moveUp = function(narrative){
      let listView = this.getListViewByNarrative(narrative);
      let currentIdx = this.narrativealistviews.indexOf(listView);
      let targetIdx = currentIdx - 1;        
      if(this.narrativealistviews[targetIdx]){
        this.swapElementsPositions(listView, this.narrativealistviews[targetIdx]);
        this.app.narrativelayout.updateLayout([narrative, this.narrativealistviews[targetIdx].narrative]);
      }
    }

    moveDown = function(narrative){
      let listView = this.getListViewByNarrative(narrative);
      let currentIdx = this.narrativealistviews.indexOf(listView);
      let targetIdx = currentIdx + 1;        

      if(this.narrativealistviews[targetIdx]){
        this.swapElementsPositions(this.narrativealistviews[targetIdx], listView);
        this.app.narrativelayout.updateLayout([narrative, this.narrativealistviews[targetIdx].narrative]);
      }    
    }
    

   swapElementsPositions = function(firstlistview, secondlistview) {
      //swap views
      let firstElm = firstlistview.container;
      let secondElm = secondlistview.container;
      firstElm.parentNode.insertBefore(firstElm, secondElm);
      //swap array
      let tmp = firstlistview;
      let firstIdx = this.narrativealistviews.indexOf(firstlistview);
      let secondIdx = this.narrativealistviews.indexOf(secondlistview);
      this.narrativealistviews[firstIdx] = secondlistview;
      this.narrativealistviews[secondIdx] = tmp;
  }

}
  