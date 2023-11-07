class NAUtil {
    static Log(d){
      console.log(d);
    }

    static DispatchEvent(name, detail){
       let event = new CustomEvent(name, {
        detail: detail
      });
      document.dispatchEvent(event);
    }

    static RemoveElementArray(idx, arr){      
      const myObject = arr[idx];
      const newArray1 = arr.filter(item => item !== myObject);
      return newArray1;
    }

    static loadJSONFile(filetype, callback) {
      // Create an input element for file selection
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.'+filetype;

      // Create a function to handle the file selection
      function handleFileSelection() {
        const selectedFile = fileInput.files[0];
        if (!selectedFile) {
          alert('No file selected. Please choose a JSON file.');
          return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
          const fileContent = e.target.result;
          const jsonData = JSON.parse(fileContent);
          callback(jsonData);
        };

        reader.readAsText(selectedFile);
        fileInput.remove();
      }

      fileInput.addEventListener('change', handleFileSelection);

      // Trigger the file picker dialog
      fileInput.click();
  }

    static ArraysContainSameItems(arr1, arr2) {
        if (arr1.length !== arr2.length) {
          return false; // If the arrays have different lengths, they can't contain the same items
        }
      
        const set1 = new Set(arr1);
        const set2 = new Set(arr2);
      
        // Check if both sets have the same size and every element from set1 is in set2
        return arr1.length === arr2.length && arr1.every(item => set2.has(item));
      }

    static GetCellChildrenLabels (name) {
      return {
        title: name + "Title",
        description: name + "Description",
      };
    };
  
    static ModelToXML (graph) {
      var encoder = new mxCodec();
      var result = encoder.encode(graph.getModel());
      var xml = mxUtils.getXml(result);
  
      return xml;
    };
  
    static GetCellByNodeName (graph, name) {
      var cells = graph.model.getCells();
      for (var i = 0; i < cells.length; i++) {
        if (!cells[i].value) continue;
        if (cells[i].value.nodeName == name) {
          return cells[i];
        }
      }
    };
  
    static Decycle (obj, stack = []) {
      if (!obj || typeof obj !== "object") return obj;
  
      if (stack.includes(obj)) return null;
  
      let s = stack.concat([obj]);
  
      return Array.isArray(obj)
        ? obj.map((x) => NAUtil.Decycle(x, s))
        : Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, NAUtil.Decycle(v, s)])
          );
    };
  
    static AddNodeClickListener (graph, name, f) {
      graph.addListener(mxEvent.CLICK, function (sender, evt) {
        var cell = evt.getProperty("cell"); // cell may be null
        if (cell != null && cell.value != null && cell.value.nodeName == name) {
          f(cell, evt);
        }
        evt.consume();
      });
    };
  
    static AddNodeDoubleClickListener (graph, name, f) {
      graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
        var cell = evt.getProperty("cell"); // cell may be null
        if (cell != null && cell.value != null && cell.value.nodeName == name) {
          f(cell, evt);
        }
        evt.consume();
      });
    };
  
    static AddPalette (sidebar, name, nodes) {
      //  var nodes = [sidebar.addDataEntry("Test", 0, 0, name, Graph.compress(xml))];
      //mxResources.get("narrativeabduction")
      sidebar.setCurrentSearchEntryLibrary("narrative", "abduction");
      sidebar.addPaletteFunctions("narrativeabduction", name, !1, nodes);
      sidebar.setCurrentSearchEntryLibrary();
    };
  
   
  }