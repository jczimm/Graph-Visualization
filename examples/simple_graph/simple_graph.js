/**
  @author David Piegza

  Implements a simple graph drawing with force-directed placement in 2D and 3D.

  It uses the force-directed-layout implemented in:
  https://github.com/davidpiegza/Graph-Visualization/blob/master/layouts/force-directed-layout.js

  Drawing is done with Three.js: http://github.com/mrdoob/three.js

  To use this drawing, include the graph-min.js file and create a SimpleGraph object:

  <!DOCTYPE html>
  <html>
    <head>
      <title>Graph Visualization</title>
      <script type="text/javascript" src="path/to/graph-min.js"></script>
    </head>
    <body onload="new Drawing.SimpleGraph({layout: '3d', showStats: true, showInfo: true})">
    </bod>
  </html>

  Parameters:
  options = {
    layout: "2d" or "3d"

    showStats: <bool>, displays FPS box
    showInfo: <bool>, displays some info on the graph and layout
              The info box is created as <div id="graph-info">, it must be
              styled and positioned with CSS.


    selection: <bool>, enables selection of nodes on mouse over (it displays some info
               when the showInfo flag is set)


    limit: <int>, maximum number of nodes

    numNodes: <int> - sets the number of nodes to create.
    numEdges: <int> - sets the maximum number of edges for a node. A node will have
              1 to numEdges edges, this is set randomly.
  }


  Feel free to contribute a new drawing!

 */

var Drawing = Drawing || {};

Drawing.SimpleGraph = function(options) {
  options = options || {};

  this.layout = options.layout || "2d";
  this.layout_options = options.graphLayout || {};
  this.show_stats = options.showStats || false;
  this.show_info = options.showInfo || false;
  this.show_labels = options.showLabels || false;
  this.selection = options.selection || false;
  this.limit = options.limit || 10;
  this.nodes_count = options.numNodes || 20;
  this.edges_count = options.numEdges || 10;

  var camera, controls, scene, renderer, interaction, geometry, object_selection;
  var stats;
  var info_text = {};
  var graph = new GRAPHVIS.Graph({limit: options.limit});

  var geometries = [];

  var that=this;

  init();
  createGraph();
  animate();

  function init() {
    // Three.js initialization
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 1000000);
    camera.position.z = 10000;

    controls = new THREE.TrackballControls(camera);

    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 5.2;
    controls.panSpeed = 1;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [ 65, 83, 68 ];

    controls.addEventListener('change', render);

    scene = new THREE.Scene();

    // Node geometry
    if(that.layout === "3d") {
      geometry = new THREE.SphereGeometry(30);
    } else {
      geometry = new THREE.BoxGeometry( 50, 50, 0 );
    }

    // Create node selection, if set
    if(that.selection) {
      object_selection = new THREE.ObjectSelection({
        domElement: renderer.domElement,
        selected: function(obj) {
          // display info
          if(obj !== null) {
            console.log(obj);
            info_text.select = "Object " + obj.id;
          } else {
            delete info_text.select;
          }
        },
        clicked: function(obj) {
        }
      });
    }

    document.body.appendChild( renderer.domElement );

    // Stats.js
    if(that.show_stats) {
      stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.top = '0px';
      document.body.appendChild( stats.domElement );
    }

    // Create info box
    if(that.show_info) {
      var info = document.createElement("div");
      var id_attr = document.createAttribute("id");
      id_attr.nodeValue = "graph-info";
      info.setAttributeNode(id_attr);
      document.body.appendChild( info );
    }
  }


  /**
   *  Creates a graph with random nodes and edges.
   *  Number of nodes and edges can be set with
   *  numNodes and numEdges.
   */
  function createGraph() {

    // TEMP: hard-coding data for testing
    // from https://codepen.io/jczimm/pen/VBBZOz
    const bucket = {"tracks":[{"trackId":480700689},{"trackId":359978594},{"trackId":356671463},{"trackId":356272697},{"trackId":344049175,"tags":["electronic","ambient","experimental","hiphopbeat"]},{"trackId":185501964,"tags":["electronic","ambient","chill"]},{"trackId":340786932},{"trackId":340014346,"tags":["electronic","rap","experimental"]},{"trackId":340864271},{"trackId":338882196},{"trackId":340850433},{"trackId":340858419},{"trackId":339810494},{"trackId":340187504,"tags":["funky","future"]},{"trackId":340158750,"tags":["electronic"]},{"trackId":340004927},{"trackId":337445405},{"trackId":340028180},{"trackId":339848591},{"trackId":339804837,"tags":["rap","electronic"]},{"trackId":339452530},{"trackId":339712633,"tags":["electronic","house","future"]},{"trackId":337440468,"tags":["electronic","remix"]},{"trackId":343562073},{"trackId":337864490,"tags":["electronic"]},{"trackId":320515013,"tags":["experimental","electronic","chill"]},{"trackId":307741754,"tags":["ambient","electronic"]},{"trackId":310703664,"tags":["electronic","future"]},{"trackId":305079285,"tags":["experimental"]},{"trackId":303601544},{"trackId":303504889,"tags":["funky","chill"]},{"trackId":300196390,"tags":["ambient","electronic"]},{"trackId":220929372,"tags":["electronic","trap"],"note":"hype but chill"},{"trackId":211483614,"tags":["ambient","electronic"]},{"trackId":291958088,"tags":["electronic","ambient","experimental","chill"]},{"trackId":257091221,"tags":["electronic","ambient","chill"],"note":"has a nice, heavy beat"},{"trackId":297755853,"tags":["experimental","electronic","chill","funky"]},{"trackId":296685652,"tags":["electronic","rap"]},{"trackId":214698107},{"trackId":270011377,"tags":["electronic","experimental","chill"]},{"trackId":292125528,"tags":["electronic","ambient","chill"]},{"trackId":299510194,"tags":["electronic","experimental","remix"]},{"trackId":298434286,"tags":["electronic","funky","remix"]},{"trackId":264628389,"tags":["ambient","chill"]},{"trackId":297297656},{"trackId":296502414,"tags":["ambient","electronic","chill"]},{"trackId":297156837,"tags":["electronic","ambient","experimental"]},{"trackId":297455260},{"trackId":292618548,"tags":["electronic","chill"]},{"trackId":295592367,"tags":["electronic","future","trap"]},{"trackId":296087000,"tags":["electronic"]},{"trackId":295165549,"tags":["electronic","funky","deep"]},{"trackId":295165352,"tags":["electronic","chill"]},{"trackId":294489171,"tags":["electronic","experimental","trap"]},{"trackId":295161513,"tags":["electronic","future","chill"]},{"trackId":227042825,"tags":["electronic","ambient","chill"]},{"trackId":246195391,"tags":["electronic"]},{"trackId":274569356,"tags":["remix"]},{"trackId":281670564,"tags":["remix","electronic"]},{"trackId":281024707,"tags":["electronic","deep","house","remix"]},{"trackId":294901395,"tags":["chill","electronic"]},{"trackId":294279693,"tags":["electronic","experimental","remix"]},{"trackId":284887739,"tags":["electronic","ambient","future","chill","experimental","remix"]},{"trackId":294231299,"tags":["electronic","experimental"]},{"trackId":293351192},{"trackId":293196567,"tags":["electronic","trap"]},{"trackId":294164740,"tags":["electronic","ambient","cover"]},{"trackId":294164678,"tags":["electronic","funky","experimental"]},{"trackId":188441762,"tags":["electronic","experimental","ambient"]},{"trackId":293659186,"tags":["electronic","ambient"]},{"trackId":293969465,"tags":["electronic","chill"]},{"trackId":293585764,"tags":["electronic","experimental","chill"]},{"trackId":267315572},{"trackId":285435997,"tags":["electronic","chill"]},{"trackId":228024161,"tags":["remix","electronic","chill"]},{"trackId":283523608,"tags":["electronic","future","funky"]},{"trackId":285853076,"tags":["electronic","future","chill"]},{"trackId":285709322,"tags":["electronic","remix","experimental"]},{"trackId":284266335,"tags":[]},{"trackId":283814781,"tags":["electronic","ambient","chill"]},{"trackId":245940906,"tags":["ambient","electronic"]},{"trackId":283852262},{"trackId":266399001},{"trackId":283052283},{"trackId":283083300},{"trackId":248426231},{"trackId":282734118},{"trackId":281672945},{"trackId":271291165},{"trackId":281674269},{"trackId":278404934},{"trackId":278366594},{"trackId":271409580},{"trackId":271256313}],"tags":["electronic","ambient","experimental","future","funky","trap","chill","rap","deep","remix","house","cover","hiphopbeat"]};
    const trackNodes = [];
    let trackNodeId;
    const edges = [];
    bucket.tracks.forEach(({ trackId, tags }) => {
      if (tags && tags.length) {
        trackNodeId = `T${trackId}`;
        trackNodes.push({
          id: trackNodeId,
          label: '',
          group: 'tracks',
        });
        tags.forEach(tag => {
          edges.push({
            from: trackNodeId,
            to: `C${tag}`,
          });
        });
      }
    });

    const tagNodes = bucket.tags.map(tag => ({
      id: `C${tag}`,
      label: tag,
      group: 'tags',
    }));

    const nodes = trackNodes.concat(tagNodes);

    // render the nodes and edges based on the arrays of node and edge data
    const graphVisNodes = {};
    let newNode;
    nodes.forEach((node) => {
      newNode = new GRAPHVIS.Node(node.id);
      if (node.label) newNode.data.title = node.label;
      newNode.data.group = node.group;

      if (graph.addNode(newNode)) drawNode(newNode);
      graphVisNodes[newNode.id] = newNode;
    });
    let fromNode, toNode;
    edges.forEach((edge) => {
      fromNode = graphVisNodes[edge.from];
      toNode = graphVisNodes[edge.to];
      if (graph.addEdge(fromNode, toNode)) drawEdge(fromNode, toNode);
    });

    that.layout_options.width = that.layout_options.width || 2000;
    that.layout_options.height = that.layout_options.height || 2000;
    that.layout_options.iterations = that.layout_options.iterations || 100000;
    that.layout_options.layout = that.layout_options.layout || that.layout;
    graph.layout = new Layout.ForceDirected(graph, that.layout_options);
    graph.layout.init();
    info_text.nodes = "Nodes " + graph.nodes.length;
    info_text.edges = "Edges " + graph.edges.length;
  }

  /**
   *  Create a node object and add it to the scene.
   */
  function drawNode(node) {
    // also hard-coded TMP
    const nodeColors = {
      tracks: 0xcd5c5c, // raudio red
      tags: 0x97ba28 // raudio green
    };

    var draw_object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {  color: nodeColors[node.data.group], opacity: 0.8 } ) );
    var label_object;

    if(that.show_labels) {
      if(node.data.title !== undefined) {
        label_object = new THREE.Label(node.data.title);
      } else {
        label_object = new THREE.Label(node.id);
      }
      node.data.label_object = label_object;
      scene.add( node.data.label_object );
    }

    var area = 5000;
    draw_object.position.x = Math.floor(Math.random() * (area + area + 1) - area);
    draw_object.position.y = Math.floor(Math.random() * (area + area + 1) - area);

    if(that.layout === "3d") {
      draw_object.position.z = Math.floor(Math.random() * (area + area + 1) - area);
    }

    draw_object.id = node.id;
    node.data.draw_object = draw_object;
    node.position = draw_object.position;
    scene.add( node.data.draw_object );
  }


  /**
   *  Create an edge object (line) and add it to the scene.
   */
  function drawEdge(source, target) {
      material = new THREE.LineBasicMaterial({ color: 0x777777 });

      var tmp_geo = new THREE.Geometry();
      tmp_geo.vertices.push(source.data.draw_object.position);
      tmp_geo.vertices.push(target.data.draw_object.position);

      line = new THREE.LineSegments( tmp_geo, material );
      line.scale.x = line.scale.y = line.scale.z = 1;
      line.originalScale = 1;

      // NOTE: Deactivated frustumCulled, otherwise it will not draw all lines (even though
      // it looks like the lines are in the view frustum).
      line.frustumCulled = false;

      geometries.push(tmp_geo);

      scene.add( line );
  }


  function animate() {
    requestAnimationFrame( animate );
    controls.update();
    render();
    if(that.show_info) {
      printInfo();
    }
  }


  function render() {
    var i, length, node;

    // Generate layout if not finished
    if(!graph.layout.finished) {
      info_text.calc = "<span style='color: red'>Calculating layout...</span>";
      graph.layout.generate();
    } else {
      info_text.calc = "";
    }

    // Update position of lines (edges)
    for(i=0; i<geometries.length; i++) {
      geometries[i].verticesNeedUpdate = true;
    }


    // Show labels if set
    // It creates the labels when this options is set during visualization
    if(that.show_labels) {
      length = graph.nodes.length;
      for(i=0; i<length; i++) {
        node = graph.nodes[i];
        if(node.data.label_object !== undefined) {
          node.data.label_object.position.x = node.data.draw_object.position.x;
          node.data.label_object.position.y = node.data.draw_object.position.y - 100;
          node.data.label_object.position.z = node.data.draw_object.position.z;
          node.data.label_object.lookAt(camera.position);
        } else {
          var label_object;
          if(node.data.title !== undefined) {
            label_object = new THREE.Label(node.data.title, node.data.draw_object);
          } else {
            label_object = new THREE.Label(node.id, node.data.draw_object);
          }
          node.data.label_object = label_object;
          scene.add( node.data.label_object );
        }
      }
    } else {
      length = graph.nodes.length;
      for(i=0; i<length; i++) {
        node = graph.nodes[i];
        if(node.data.label_object !== undefined) {
          scene.remove( node.data.label_object );
          node.data.label_object = undefined;
        }
      }
    }

    // render selection
    if(that.selection) {
      object_selection.render(scene, camera);
    }

    // update stats
    if(that.show_stats) {
      stats.update();
    }

    // render scene
    renderer.render( scene, camera );
  }

  /**
   *  Prints info from the attribute info_text.
   */
  function printInfo(text) {
    var str = '';
    for(var index in info_text) {
      if(str !== '' && info_text[index] !== '') {
        str += " - ";
      }
      str += info_text[index];
    }
    document.getElementById("graph-info").innerHTML = str;
  }

  // Generate random number
  function randomFromTo(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
  }

  // Stop layout calculation
  this.stop_calculating = function() {
    graph.layout.stop_calculating();
  };
};
