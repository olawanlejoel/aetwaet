// Contract Source
const contractSource = `
payable contract AeTwaet =

  record twaet={
    writerAddress: address,
    name: string,
    avatar: string,
    twaetBody: string,
    totalTips: int,
    tipsCount: int}

  record state = {
    twaets: map(string, twaet)}

  stateful entrypoint init(): state = {twaets={}}

  // get a twaet
  entrypoint getTwaet(id') = 
    switch(Map.lookup(id', state.twaets))
      None => abort("There is no twaet with this id")
      Some(x) => x
      
  // get all twaets
  entrypoint getAllTwaets() =
    state.twaets


  // add a twaet
  stateful entrypoint addTwaet(id', name', avatar', twaet') =

    let newTwaet = {
      writerAddress = Call.caller,
      name = name',
      avatar = avatar',
      twaetBody = twaet',
      totalTips = 0,
      tipsCount = 0,
      likeCount = 0}

    put(state{twaets[id'] = newTwaet})

  // Tip a twaet
  payable stateful entrypoint tipTwaet(id', amount') =
    let twaet = getTwaet(id')
    Chain.spend(twaet.writerAddress, Call.value)
    let newTotalTips = twaet.totalTips + Call.value
    let newTipsCount = twaet.tipsCount + 1
    let updatedTwaet ={
      writerAddress = twaet.writerAddress,
      name = twaet.name,
      avatar = twaet.avatar,
      twaetBody = twaet.twaetBody,
      totalTips = newTotalTips,
      tipsCount = newTipsCount,
      likeCount = twaet.likeCount}
    put(state{twaets[id'] = updatedTwaet})
    
  // like a post
  stateful entrypoint likeTwaet(id') =
    let twaet = getTwaet(id')
    let updatedLikeCount = twaet.likeCount + 1
    let updatedTwaets = state.twaets{ [id'].likeCount = updatedLikeCount }
    put(state{twaets = updatedTwaets})
    
  // Unlike a post
  stateful entrypoint unlikeTwaet(id') =
    let twaet = getTwaet(id')
    let updatedLikeCount = twaet.likeCount - 1
    let updatedTwaets = state.twaets{ [id'].likeCount = updatedLikeCount }
    put(state{twaets = updatedTwaets}) 
`;

const contractAddress = 'ct_2fc8LXC3LBA5eAfQ3rBrUFxDYLDJdAcF1ZfxdDfEEk9Nv3x9Tv';

let client = null;

let twaetData = [];

let twaetsContainer = document.querySelector('.tweets__container');

// Attach event listener to the floating button
document.querySelector('.float__btn').addEventListener('click', function(){
  document.querySelector('.tweets__entry').classList.add('show-modal');
});

// Attach event listener to the close button on the form modal container
document.querySelector('#close-form').addEventListener('click', function(){
  document.querySelector('.tweets__entry').classList.remove('show-modal');
});

/* 
The function controls the state of the spinner modal by adding/removing the show-modal class from the element. */
function toggleSpinner(state){
  if(state === true){
    document.querySelector('.spinner__modal').classList.add('show-modal');
  } else {
    document.querySelector('.spinner__modal').classList.remove('show-modal');
  }
}

// Contract Call
 async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to write smart contract func, with aeon value input
  const query = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return query;
}

// Call Static
async function callStatic(func, args) {
  //Create a new contract instance 
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to get data of smart contract func, with specefied arguments
  const query = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  //Make another call to decode the data received in first call
  const decodedResponse = await query.decode().catch(e => console.error(e));

  return decodedResponse;
}

window.addEventListener('load', async function(){
  // Display the spinner modal
  toggleSpinner(true);

  //Initialize the Aepp object 
  client = await Ae.Aepp();

  // Make a call to fetch all twaets available on the blockchain
  const allTwaets = await callStatic('getAllTwaets', []);

  // check if data is returned
  if(allTwaets){
    twaetData = allTwaets;

    // display twaets
    renderTwaets();
  } else{
    twaetsContainer.textContent = 'There are no twaets available.';
  }

  toggleSpinner(false);
});

/* ------------
The function takes an object as a parameter - the parameter species the various details of the element. An HTML element is returned by the function  */
const createNewElement = params => {
	// destructure params
	const {elementType, elementId, elementClass, elementText} = params;

	let newElement;

	// create new html element
	if(elementType){
		newElement = document.createElement(elementType);
	} else {
		return false;
	}
	
	// Append ID
  if(elementId){
    newElement.id = elementId;
  }

  // append class(es)
  if(elementClass){
    newElement.classList.add(elementClass);
  }
  
  // append text content
  if(elementText){
  	newElement.textContent = elementText;
  }

  return newElement;
}

/* -----------
The function takes in a parameter and generates a twaet panel */
const createTwaetPanel = item=>{
  const twaetPanel = createNewElement({
    elementType: 'section',
    elementClass: 'twaet__panel',
    elementId: item[0]
  });

  // Twaet Header - holds the avatar and twaet's text content
  let twaetHeader = createNewElement({
    elementType: 'article',
    elementClass: 'twaet__panel__header'
  });
  twaetPanel.appendChild(twaetHeader);

  // Twaet Avatar Container
  let avatarContainer = createNewElement({
    elementType: 'article',
    elementClass: 'twaet__image__container'
  });
  twaetHeader.appendChild(avatarContainer);

  // Avatar 
  let twaetAvatar = document.createElement('img');
  twaetAvatar.src = item[1].avatar;
  twaetAvatar.setAttribute('alt', item[1].name);
  avatarContainer.appendChild(twaetAvatar);

  // Twaet Text Content Container
  let textContainer = createNewElement({
    elementType: 'p',
    elementClass: 'twaet__content',
  });
  twaetHeader.appendChild(textContainer);

  // Twaet Name
  textContainer.appendChild(createNewElement({
    elementType: 'strong',
    elementClass: 'twaet__name',
    elementText: item[1].name
  }));
 
  // Twaet Content
  textContainer.appendChild(createNewElement({
    elementType: 'span',
    elementClass: 'twaet__text',
    elementText: item[1].twaetBody
  }));

  // Twaet Info
  twaetPanel.appendChild(createNewElement({
    elementType: 'p',
    elementClass: 'twaet__info',
    elementText: `This twaet has accrued ${item[1].totalTips} ae with ${item[1].tipsCount} tips.`
  }));

  // Twaet Action
  let twaetAction = createNewElement({
    elementType: 'article',
    elementClass: 'twaet__action'
  });
  twaetPanel.appendChild(twaetAction);

  // Twaet Input
  let twaetInput = document.createElement('input');
  twaetInput.setAttribute('type', 'number');
  twaetInput.id = 'tip-entry';
  twaetInput.setAttribute('placeholder', 'Enter tip');
  twaetAction.appendChild(twaetInput);

  // Submit Button
  let submitBtn = createNewElement({
    elementType: 'button',
    elementText: 'Tip Twaet',
    elementClass: 'btn-primary'
  });
  submitBtn.setAttribute('type', 'button');
  twaetAction.appendChild(submitBtn);

  return twaetPanel;
}

/* --------
The function renders the twaets panel */
const renderTwaets =()=>{
   // map the content of twaetData to create twaet panels
   const docFrag = document.createDocumentFragment();
   twaetData.sort().map(item =>{
     docFrag.appendChild(createTwaetPanel(item))
   });

   // append panels to the twaets container
   twaetsContainer.appendChild(docFrag);
}