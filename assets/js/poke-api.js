const pokeApi = {}

function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon()
    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.name

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
    const [type] = types

    pokemon.types = types
    pokemon.type = type

    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default || 
                   pokeDetail.sprites.other['official-artwork'].front_default ||
                   pokeDetail.sprites.front_default

    // Processando estatísticas
    pokemon.stats = pokeDetail.stats.map(stat => ({
        name: stat.stat.name,
        value: stat.base_stat
    }))

    // Informações físicas
    pokemon.height = pokeDetail.height / 10
    pokemon.weight = pokeDetail.weight / 10
    pokemon.abilities = pokeDetail.abilities.map(ability => ability.ability.name)

    return pokemon
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => {
            if (!response.ok) throw new Error('Erro na requisição')
            return response.json()
        })
        .then(convertPokeApiDetailToPokemon)
        .catch(error => {
            console.error('Erro ao carregar detalhes:', error)
            return null
        })
}

pokeApi.getPokemonDetailById = (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`
    return fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error('Pokémon não encontrado')
            return response.json()
        })
        .then(convertPokeApiDetailToPokemon)
        .catch(error => {
            console.error('Erro ao carregar Pokémon:', error)
            return null
        })
}

pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`

    return fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error('Erro na requisição')
            return response.json()
        })
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails.filter(pokemon => pokemon !== null))
        .catch(error => {
            console.error('Erro ao carregar lista de Pokémon:', error)
            return []
        })
}