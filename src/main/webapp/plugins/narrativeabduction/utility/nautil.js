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
    static GetNarrativeFromCell(cell, arr){
      let na = null;
      arr.forEach(narrative => {
          if(narrative != null && narrative.rootcell == cell){
            na = narrative;        
          }
      });
      return na;
  }
  static downloadJSONFile(jsonObject, filename){
      // Get the text you want to save
      let textToSave = JSON.stringify(jsonObject, null, 2);
          
      // Create a Blob with the text content
      let blob = new Blob([textToSave], { type: "text/plain" });

      // Create a temporary link element for triggering the download
      let a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);

      a.download = filename + ".json";
      // Trigger a click event on the link to initiate the download
      a.click();
      a.remove();
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
  
    static ParseStyleString(styleString) {
      // Split the style string into individual key-value pairs
      var stylePairs = styleString.split(';');
  
      // Create an empty object to store the parsed style
      var styleObject = {};
  
      // Iterate over each key-value pair
      stylePairs.forEach(function(pair) {
          
        // Split the pair into key and value
          var keyValue = pair.split('=');
  
          if(keyValue[0] && keyValue[1]){
            // Trim any leading or trailing whitespaces
            var key = keyValue[0].trim();
            var value = keyValue[1].trim();

            // Add the key-value pair to the style object
            styleObject[key] = value;
          }  
         
      });
  
      return styleObject;
  }

  static StringifyStyleObject(styleObject) {
    // Create an empty array to store key-value pairs
    var stylePairs = [];

    // Iterate over each property in the style object
    for (var key in styleObject) {
        if (styleObject.hasOwnProperty(key)) {
            // Convert boolean values to strings
            var value = styleObject[key];           
            // Add the key-value pair to the array
            stylePairs.push(key + '=' + value);
        }
    }
    // Join the array into a string using semicolons
    var styleString = stylePairs.join(';');

    return styleString;
}
  
  }