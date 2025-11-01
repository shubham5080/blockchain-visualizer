class Block {
  constructor(index, data, previousHash = '') {
    this.index = index;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return CryptoJS.SHA256(
      this.index + this.previousHash + JSON.stringify(this.data)
    ).toString();
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }
}

let blockchain = new Blockchain();

function renderBlockchain() {
  const container = document.getElementById('blockchain');
  container.innerHTML = '';

  blockchain.chain.forEach((block, idx) => {
    const div = document.createElement('div');
    div.className = 'block';
    div.innerHTML = `
      <p><strong>Index:</strong> ${block.index}</p>
      <label><strong>Data:</strong></label>
      <input id="data-${idx}" value='${JSON.stringify(block.data)}'>
      <p><strong>Prev Hash:</strong> ${block.previousHash.slice(0, 20)}...</p>
      <p><strong>Hash:</strong> <span id="hash-${idx}">${block.hash.slice(0, 20)}...</span></p>
    `;

    container.appendChild(div);

    // Real-time editing
    document.getElementById(`data-${idx}`).addEventListener('input', e => {
      try {
        block.data = JSON.parse(e.target.value);
      } catch {
        block.data = e.target.value; // raw string if invalid JSON
      }
      block.hash = block.calculateHash();
      renderBlockchain(); // re-render whole chain
    });
  });

  updateChainStatus();
}

function updateChainStatus() {
  const isValid = blockchain.isChainValid();
  const statusEl = document.getElementById('chainStatus');
  statusEl.textContent = isValid ? "✅ Chain is VALID" : "❌ Chain is BROKEN";
  statusEl.style.color = isValid ? "#22c55e" : "#ef4444";

  document.querySelectorAll('.block').forEach((blockDiv, i) => {
    blockDiv.classList.remove('valid', 'invalid');
    blockDiv.classList.add(isValid ? 'valid' : 'invalid');
  });
}

document.getElementById('addBlockBtn').addEventListener('click', () => {
  const data = { amount: Math.floor(Math.random() * 100) };
  const newBlock = new Block(blockchain.chain.length, data);
  blockchain.addBlock(newBlock);
  renderBlockchain();
});

renderBlockchain();
