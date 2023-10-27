class NAUIHelper {

    static CreateWindow (id, title, content, x, y, width, height) {
        let wnd = new mxWindow(title, content, x, y, width, height, true, true);
        wnd.id = id;
        return wnd;
    };

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