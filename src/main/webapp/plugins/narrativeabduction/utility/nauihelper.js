class NAUIHelper {

    static CreateWindow (id, title, content, x, y, width, height) {
        let wnd = new mxWindow(title, content, x, y, width, height, true, true);
        wnd.id = id;
        return wnd;
    };

    /**
     * menus
     * [
        * {
        *  name: "File",
        *  actions: [
        *      {
        *          name: "Download",
        *            title: "Download the text",
        *          func: function
        *      }
        *  ]
        * }
     * }
     * ]
     * 
     * @param {*} menu 
     * @param {*} contanier 
     */
    static CreateMenu(menus, contanier){
        const menuscontainer = document.createElement('div');
        menuscontainer.style = "border-bottom: 1px solid lightgray;padding-bottom: 5px;margin-bottom: 5px; display:inline-flex;";
            menus.forEach(menu => {
            //create button
            const menucontainer = document.createElement('div');
            const childrencontainer = document.createElement('div');
            const parentbtn = document.createElement('a');
            parentbtn.style.cursor = "pointer";
            parentbtn.style.padding = "10px";
            parentbtn.style.marginRight = "5px";

            childrencontainer.style = "display: grid;position: absolute;background: #f1f3f4;border:1px solid lightgray;padding: 5px;display:none";

            parentbtn.innerHTML = menu.name;
            parentbtn.addEventListener("click", function(){
                if(childrencontainer.style.display == "none"){
                    childrencontainer.style.display = "grid";
                }else{
                    childrencontainer.style.display = "none";
                }
            })

            menucontainer.append(parentbtn);
            menucontainer.append(childrencontainer);
            menu.actions.forEach(action => {
                let actionbtn = document.createElement('a');
                actionbtn.style.cursor = "pointer";
                actionbtn.style.paddingBottom = "5px";
                actionbtn.innerHTML = action.name;
                actionbtn.title = action.title;
                actionbtn.addEventListener("click", function(){
                    action.func();
                    childrencontainer.style.display = "none";
                });
                childrencontainer.append(actionbtn);
            });

            menuscontainer.append(menucontainer);
        });

        contanier.append(menuscontainer);
        return menuscontainer;
    }

    static AddButton (label, container, funct) {
        let btn = document.createElement("button");
        btn.innerHTML = label;
        btn.classList.add(NASettings.CSSClasses.NAUtils.Button);

        mxEvent.addListener(btn, "click", function (evt) {
        funct();
        mxEvent.consume(evt);
        });

        container.appendChild(btn);

        return btn;
    };

    static CreateHelpText(container, text, defaultstate){
        let helpcontainer = document.createElement("div");
        let textcontainer = document.createElement("div");
        let toggle = document.createElement("button");

        let helptext = "help?";
        textcontainer.innerHTML = text;

        helpcontainer.style = "margin-bottom: 5px";
        toggle.style = "font-size:8px;";
        textcontainer.style = "border:1px solid lightgray; font-size;8px; padding:5px";
        toggle.innerHTML = "help";
        toggle.addEventListener("click", function(evt){
            if(this.innerHTML == helptext){
                toggle.innerHTML = "hide";
                textcontainer.style.display = "block";
            }else{
                toggle.innerHTML = helptext;
                textcontainer.style.display = "none";
            }
        });

        if(!defaultstate) {
            toggle.innerHTML = helptext;
            textcontainer.style.display = "none";
        }else{
            toggle.innerHTML = helptext;
            textcontainer.style.display = "block";
        }

        helpcontainer.append(toggle);
        helpcontainer.append(textcontainer);
        container.append(helpcontainer);

        return helpcontainer;
    }
}