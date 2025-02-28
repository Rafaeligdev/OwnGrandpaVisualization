document.addEventListener('DOMContentLoaded', function() {
  // Timeline progress elements
  const progressSlider = document.getElementById('progress-slider');
  const progressValue = document.getElementById('progress-value');
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resetBtn = document.getElementById('reset-btn');
  const currentEvents = document.getElementById('current-events');
  const lyricsContent = document.getElementById('lyrics-content');
  
  // Animation control
  let animationInterval = null;
  const animationSpeed = 30; // milliseconds
  
  // Create a tooltip element
  const tooltip = document.getElementById('tooltip');
  
  // Network visualization setup
  const container = document.getElementById('network');
  
  // All nodes that will appear in the visualization
  const allNodes = [
    { id: 1, label: "Narrator\n(23 years old)", shape: "box", color: { background: "#E57373", border: "#D32F2F" } },
    { id: 2, label: "Widow\n(Narrator's Wife)", shape: "box", color: { background: "#F06292", border: "#C2185B" } },
    { id: 3, label: "Widow's Daughter\n(Red Hair)", shape: "box", color: { background: "#BA68C8", border: "#7B1FA2" } },
    { id: 4, label: "Narrator's Father", shape: "box", color: { background: "#64B5F6", border: "#1976D2" } },
    { id: 5, label: "Narrator's Baby Boy", shape: "box", color: { background: "#4FC3F7", border: "#0288D1" } },
    { id: 6, label: "Widow's Son\n(with Narrator)", shape: "box", color: { background: "#81C784", border: "#388E3C" } }
  ];
  
  // All edges that will appear in the visualization
  const allEdges = [
    // Stage 1: Narrator marries the widow
    { id: 1, from: 1, to: 2, label: "Married", arrows: "", color: { color: "#FF9999", highlight: "#FF0000" }, width: 3, stage: 1 },
    
    // Stage 1: Widow already has a daughter
    { id: 2, from: 2, to: 3, label: "Mother of", arrows: "to", color: { color: "#99CCFF", highlight: "#0000FF" }, width: 2, stage: 1 },
    
    // Stage 2: Narrator's father marries widow's daughter
    { id: 3, from: 3, to: 4, label: "Married", arrows: "", color: { color: "#FF9999", highlight: "#FF0000" }, width: 3, stage: 2 },
    { id: 4, from: 4, to: 1, label: "Father of", arrows: "to", color: { color: "#99CCFF", highlight: "#0000FF" }, width: 2, stage: 2 },
    
    // Stage 2: New relationships from father's marriage
    { id: 5, from: 1, to: 4, label: "Son-in-law of", arrows: "to", dashes: true, color: { color: "#FFC107", highlight: "#FF9800" }, width: 2, stage: 2 },
    { id: 6, from: 3, to: 1, label: "Step-mother of", arrows: "to", dashes: true, color: { color: "#FFC107", highlight: "#FF9800" }, width: 2, stage: 2 },
    
    // Stage 3: Narrator has a baby boy
    { id: 7, from: 1, to: 5, label: "Father of", arrows: "to", color: { color: "#99CCFF", highlight: "#0000FF" }, width: 2, stage: 3 },
    { id: 8, from: 3, to: 5, label: "Mother of", arrows: "to", dashes: true, color: { color: "#FFC107", highlight: "#FF9800" }, width: 2, stage: 3 },
    
    // Stage 3: New relationships from baby boy
    { id: 9, from: 5, to: 4, label: "Brother-in-law of", arrows: "to", dashes: true, color: { color: "#66BB6A", highlight: "#4CAF50" }, width: 1, stage: 3 },
    // { id: 10, from: 4, to: 5, label: "Father of", arrows: "to", color: { color: "#99CCFF", highlight: "#0000FF" }, width: 2, stage: 3 },
    
    // Stage 4: Widow and narrator have a son
    { id: 11, from: 2, to: 6, label: "Mother of", arrows: "to", color: { color: "#99CCFF", highlight: "#0000FF" }, width: 2, stage: 4 },
    { id: 12, from: 1, to: 6, label: "Father of", arrows: "to", color: { color: "#99CCFF", highlight: "#0000FF" }, width: 2, stage: 4 },
    
    // Stage 4: New relationships from widow's son
    { id: 13, from: 6, to: 5, label: "Uncle of", arrows: "to", dashes: true, color: { color: "#66BB6A", highlight: "#4CAF50" }, width: 1, stage: 4 },
    { id: 14, from: 6, to: 1, label: "Grandchild of", arrows: "to", dashes: true, color: { color: "#FFC107", highlight: "#FF9800" }, width: 1, stage: 5 },
    
    // Stage 5: Final revelation - the paradox
    { id: 15, from: 2, to: 1, label: "Grandmother of", arrows: "to", dashes: true, color: { color: "#FFC107", highlight: "#FF9800" }, width: 1, stage: 5 },
    { id: 16, from: 1, to: 1, label: "Granda/Grandchild of", arrows: "to", dashes: true, color: { color: "#ff07de", highlight: "#ff07de" }, width: 1, stage: 5 }
  ];
  
  // Song verses and events for the timeline
  const songStages = [
    {
      stage: 0,
      progress: 0,
      title: "Introduction",
      verse: "Start of the story",
      events: "Our narrator is 23 years old and single, about to embark on a complex family journey."
    },
    {
      stage: 1,
      progress: 20,
      title: "The Narrator's Marriage",
      verse: "Many many years ago when I was twenty-three, I was married to a widow who was pretty as could be. This widow had a grown-up daughter who had hair of red.",
      events: "The narrator (age 23) marries a widow who already has an adult daughter with red hair."
    },
    {
      stage: 2,
      progress: 40,
      title: "Father's Marriage to Daughter",
      verse: "My father fell in love with her and soon the two were wed. This made my dad my son-in-law and changed my very life. My daughter was my mother 'cause she was my father's wife.",
      events: "The narrator's father marries the widow's daughter (with red hair). This creates the first complex relationships: the narrator's father becomes his son-in-law, and the widow's daughter becomes the narrator's stepmother."
    },
    {
      stage: 3,
      progress: 60,
      title: "The Baby Boy",
      verse: "To complicate the matters even though it brought me joy, I soon became the father of a bouncing baby boy. My little baby then became a brother-in-law to dad, and so became my uncle though it made me very sad.",
      events: "The narrator and his wife (the widow) have a baby boy. Because of the previous marriage arrangements, this baby boy is also a brother-in-law to the narrator's father, making the baby boy the narrator's uncle."
    },
    {
      stage: 4,
      progress: 80,
      title: "The Widow's Son",
      verse: "My father's wife then had a son that kept them on the run. And he became my grandchild for he was my daughter's son. My wife is now my mother's mother and it makes me blue because, she is my wife, she's my grandmother too.",
      events: "The narrator's father and his wife (the widow's daughter) have a son together. This son is technically the narrator's grandchild because he is the son of the narrator's 'daughter' (stepmother)."
    },
    {
      stage: 5,
      progress: 100,
      title: "The Paradox Revealed",
      verse: "I'm my own grandpa. It sounds funny I know, but it really is so, I'm my own grandpa. Now, if my wife is my grandmother, then, I am her grandchild. And every time I think of it, it nearly drives me wild. For now I have become the strangest case you ever saw, as husband of my grandmother I am my own grandpa.",
      events: "The final revelation: Since the narrator's wife is the mother of his stepmother, she is his grandmother. And since he is married to his grandmother, he is his own grandpa!"
    }
  ];
  
  // Initialize the network with first stage nodes
  const nodes = new vis.DataSet();
  const edges = new vis.DataSet();
  
  // Network configuration
  const options = {
    nodes: {
      font: { size: 14 },
      shape: 'box',
      margin: 10,
      borderWidth: 2,
      shadow: true
    },
    edges: {
      font: {
        size: 14,
        align: 'middle'
      },
      width: 16,
      smooth: {
        selfReferenceSize: 500,
        type: 'curvedCW',
        roundness: 0.4
      }
    },
    physics: {
      enabled: false,
      stabilization: {
        enabled: false,
        iterations: 100
      },
      barnesHut: {
        gravitationalConstant: -2000,
        springConstant: 0.02,
        springLength: 250
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 200,
      hideEdgesOnDrag: true,
      zoomView: true,
      dragNodes: true
    },
    layout: {
      improvedLayout: true
    }
  };
  
  // Create the network
  const network = new vis.Network(container, { nodes, edges }, options);
  
  // Show tooltip on node hover
  network.on("hoverNode", function(params) {
    const nodeId = params.node;
    const node = nodes.get(nodeId);
    
    const connectedEdges = network.getConnectedEdges(nodeId);
    let relationships = [];
    
    connectedEdges.forEach(edgeId => {
      const edge = edges.get(edgeId);
      if (!edge) return;
      
      const targetNode = edge.from === nodeId ? edge.to : edge.from;
      const targetLabel = nodes.get(targetNode).label.split('\n')[0];
      
      let relation = "";
      if (edge.from === nodeId) {
        relation = `${edge.label} ${targetLabel}`;
      } else {
        relation = `${targetLabel} is ${edge.label} this person`;
      }
      
      relationships.push(relation);
    });
    
    // Set tooltip content and position
    tooltip.innerHTML = `<strong>${node.label}</strong><br>Relationships:<br>${relationships.length ? '• ' + relationships.join('<br>• ') : 'No relationships yet'}`;
    tooltip.style.left = params.event.center.x + 10 + 'px';
    tooltip.style.top = params.event.center.y + 10 + 'px';
    tooltip.style.display = 'block';
  });
  
  // Hide tooltip when not hovering over a node
  network.on("blurNode", function() {
    tooltip.style.display = 'none';
  });
  
  // Handle timeline slider change
  progressSlider.addEventListener('input', function() {
    updateVisualization(parseInt(this.value));
  });
  
  // Play button
  playBtn.addEventListener('click', function() {
    if (animationInterval) return;
    
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    
    const startValue = parseInt(progressSlider.value);
    let currentValue = startValue;
    
    animationInterval = setInterval(() => {
      currentValue += 1;
      if (currentValue > 100) {
        clearInterval(animationInterval);
        animationInterval = null;
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        return;
      }
      
      progressSlider.value = currentValue;
      updateVisualization(currentValue);
    }, animationSpeed);
  });
  
  // Pause button
  pauseBtn.addEventListener('click', function() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
      playBtn.disabled = false;
      pauseBtn.disabled = true;
    }
  });
  
  // Reset button
  resetBtn.addEventListener('click', function() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
      playBtn.disabled = false;
      pauseBtn.disabled = true;
    }
    
    progressSlider.value = 0;
    updateVisualization(0);
  });
  
  // Function to update visualization based on timeline progress
  function updateVisualization(progress) {
    progressValue.textContent = progress + '%';
    
    // Find the current stage based on progress
    const currentStage = findStageByProgress(progress);
    
    // Update nodes
    updateNodes(currentStage);
    
    // Update edges
    updateEdges(currentStage);
    
    // Update lyrics and events display
    updateLyricsAndEvents(currentStage);
    
    // Stabilize the network for better layout
    network.stabilize(50);
  }
  
  // Find the current stage based on progress percentage
  function findStageByProgress(progress) {
    for (let i = songStages.length - 1; i >= 0; i--) {
      if (progress >= songStages[i].progress) {
        return songStages[i].stage;
      }
    }
    return 0;
  }
  
  // Update nodes based on current stage
  function updateNodes(stage) {
    // Determine which nodes should be visible
    const visibleNodes = allNodes.filter((node, index) => {
      if (stage === 0) return index === 0; // Only narrator at start
      if (stage >= 1 && index <= 2) return true; // Stages 1-5: Nodes 0-3
      if (stage >= 2 && index === 3) return true; // Stages 1-5: Nodes 0-3
      if (stage >= 3 && index === 4) return true; // Stages 3-5: Node 4
      if (stage >= 4 && index === 5) return true; // Stages 4-5: Node 5
      return false;
    });
    
    // Get current nodes IDs
    const currentNodeIds = nodes.getIds();
    
    // Remove nodes that shouldn't be visible
    currentNodeIds.forEach(id => {
      if (!visibleNodes.some(node => node.id === id)) {
        nodes.remove(id);
      }
    });
    
    // Add new nodes that should be visible
    visibleNodes.forEach(node => {
      if (!currentNodeIds.includes(node.id)) {
        nodes.add(node);
      }
    });
  }
  
  // Update edges based on current stage
  function updateEdges(stage) {
    // Determine which edges should be visible
    const visibleEdges = allEdges.filter(edge => edge.stage <= stage);
    
    // Get current edge IDs
    const currentEdgeIds = edges.getIds();
    
    // Remove edges that shouldn't be visible
    currentEdgeIds.forEach(id => {
      if (!visibleEdges.some(edge => edge.id === id)) {
        edges.remove(id);
      }
    });
    
    // Add new edges that should be visible
    visibleEdges.forEach(edge => {
      if (!currentEdgeIds.includes(edge.id)) {
        edges.add(edge);
      }
    });
  }
  
  // Update lyrics and events display
  function updateLyricsAndEvents(stage) {
    // Update current events
    const stageInfo = songStages.find(s => s.stage === stage);
    if (stageInfo) {
      currentEvents.innerHTML = `
        <div class="current-verse">
          <strong>${stageInfo.title}</strong>
        </div>
        <div class="relationship-event">
          ${stageInfo.events}
        </div>
      `;
    } else {
      currentEvents.innerHTML = '';
    }
    
    // Update lyrics display
    lyricsContent.innerHTML = '';
    songStages.forEach(s => {
      const isCurrentOrPast = s.stage <= stage;
      const isCurrent = s.stage === stage;
      
      if (s.stage > 0) { // Skip the intro stage
        const sectionClass = isCurrent ? 'lyrics-section current' : 'lyrics-section';
        const textStyle = isCurrentOrPast ? '' : 'color: #aaa;';
        
        lyricsContent.innerHTML += `
          <div class="${sectionClass}" style="${textStyle}">
            <div class="verse-title">${s.title}</div>
            <p>${s.verse}</p>
          </div>
        `;
      }
    });
  }
  
  // Initialize with stage 0
  updateVisualization(0);
});
