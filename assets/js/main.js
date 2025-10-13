const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')
const backToTopButton = document.getElementById('backToTop')
const searchInput = document.getElementById('searchInput')
const searchButton = document.getElementById('searchButton')
const typeFilter = document.getElementById('typeFilter')
const pokemonCount = document.getElementById('pokemonCount')
const loading = document.getElementById('loading')
const modal = document.getElementById('pokemonModal')
const modalBody = document.getElementById('modalBody')
const closeModal = document.querySelector('.close')

const maxRecords = 151
const limit = 20
let offset = 0
let allPokemons = []
let filteredPokemons = []

function showLoading() {
    loading.style.display = 'flex'
}

function hideLoading() {
    loading.style.display = 'none'
}

function showModal() {
    modal.style.display = 'block'
    document.body.style.overflow = 'hidden'
}

function hideModal() {
    modal.style.display = 'none'
    document.body.style.overflow = 'auto'
}

function updatePokemonCount() {
    const count = filteredPokemons.length > 0 ? filteredPokemons.length : allPokemons.length
    pokemonCount.textContent = `${count} Pokémon(s) encontrado(s)`
}

function convertPokemonToLi(pokemon) {
    return `
        <li class="pokemon ${pokemon.type}" onclick="showPokemonDetail(${pokemon.number})">
            <span class="number">#${pokemon.number.toString().padStart(3, '0')}</span>
            <span class="name">${pokemon.name}</span>
            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>
                <img src="${pokemon.photo}" alt="${pokemon.name}" loading="lazy">
            </div>
        </li>
    `
}

function renderPokemonList(pokemons) {
    const newHtml = pokemons.map(convertPokemonToLi).join('')
    pokemonList.innerHTML = newHtml
    updatePokemonCount()
}

function filterPokemons() {
    const searchTerm = searchInput.value.toLowerCase()
    const selectedType = typeFilter.value
    
    filteredPokemons = allPokemons.filter(pokemon => {
        const matchesSearch = pokemon.name.includes(searchTerm) || 
                            pokemon.number.toString().includes(searchTerm)
        const matchesType = !selectedType || pokemon.types.includes(selectedType)
        
        return matchesSearch && matchesType
    })
    
    renderPokemonList(filteredPokemons)
}

function loadPokemonItens(offset, limit) {
    showLoading()
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        allPokemons = [...allPokemons, ...pokemons]
        filterPokemons()
        hideLoading()
    }).catch(error => {
        console.error('Erro ao carregar Pokémon:', error)
        hideLoading()
    })
}

function getStatColor(value) {
    if (value >= 100) return '#4CAF50'
    if (value >= 80) return '#8BC34A'
    if (value >= 60) return '#FFC107'
    if (value >= 40) return '#FF9800'
    return '#F44336'
}

function showPokemonDetail(pokemonNumber) {
    showLoading()
    pokeApi.getPokemonDetailById(pokemonNumber).then(pokemon => {
        const statsHtml = pokemon.stats.map(stat => {
            const percentage = Math.min((stat.value / 255) * 100, 100)
            const color = getStatColor(stat.value)
            return `
                <div class="stat-item">
                    <span class="stat-name">${stat.name.replace('-', ' ')}</span>
                    <span class="stat-value">${stat.value}</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar" style="width: ${percentage}%; background: ${color};"></div>
                    </div>
                </div>
            `
        }).join('')

        modalBody.innerHTML = `
            <div class="pokemon-detail ${pokemon.type}">
                <div class="pokemon-header">
                    <div class="number">#${pokemon.number.toString().padStart(3, '0')}</div>
                    <h1 class="name">${pokemon.name}</h1>
                    <div class="pokemon-types">
                        ${pokemon.types.map(type => `
                            <div class="type ${type}">${type}</div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="pokemon-image">
                    <img src="${pokemon.photo}" alt="${pokemon.name}">
                </div>
                
                <div class="pokemon-info">
                    <div class="info-section">
                        <h3>Estatísticas</h3>
                        <div class="stats-grid">
                            ${statsHtml}
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3>Características Físicas</h3>
                        <div class="physical-stats">
                            <div class="physical-stat">
                                <div class="label">Altura</div>
                                <div class="value">${pokemon.height}m</div>
                            </div>
                            <div class="physical-stat">
                                <div class="label">Peso</div>
                                <div class="value">${pokemon.weight}kg</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3>Habilidades</h3>
                        <div class="abilities-list">
                            ${pokemon.abilities.map(ability => `
                                <div class="ability">${ability}</div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `
        
        hideLoading()
        showModal()
        
        // Animar as barras de estatística
        setTimeout(() => {
            const statBars = document.querySelectorAll('.stat-bar')
            statBars.forEach(bar => {
                const width = bar.style.width
                bar.style.width = '0'
                setTimeout(() => {
                    bar.style.width = width
                }, 100)
            })
        }, 500)
    }).catch(error => {
        console.error('Erro ao carregar detalhes do Pokémon:', error)
        hideLoading()
    })
}

// Event Listeners
loadMoreButton.addEventListener('click', () => {
    offset += limit
    const qtdRecordsWithNexPage = offset + limit

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset
        loadPokemonItens(offset, newLimit)
        loadMoreButton.style.display = 'none'
    } else {
        loadPokemonItens(offset, limit)
    }
})

backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
})

searchInput.addEventListener('input', filterPokemons)
searchButton.addEventListener('click', filterPokemons)
typeFilter.addEventListener('change', filterPokemons)

closeModal.addEventListener('click', hideModal)
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        hideModal()
    }
})

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'block'
    } else {
        backToTopButton.style.display = 'none'
    }
})

// Inicialização
loadPokemonItens(offset, limit)