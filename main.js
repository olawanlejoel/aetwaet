// Contract Source
const contractSource = `
payable contract AeTwaet =

  record twaet={
    writerAddress: address,
    name: string,
    avatar: string,
    twaetBody: string,
    totalTips: int,
    tipsCount: int,
    likeCount: int}

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
  console.log(allTwaets);
});