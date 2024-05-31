import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const db = {
  games: [
    {id: '1', title: 'Zelda, Tears of the Kingdom', platforms: ['Switch']},
    {id: '2', title: 'Final Fantasy 7 Remake', platforms: ['PS5', 'Xbox']},
    {id: '3', title: 'Elden Ring', platforms: ['PS5', 'Xbox', 'PC']},
    {id: '4', title: 'Mario Kart', platforms: ['Switch']},
    {id: '5', title: 'Pokemon Scarlet', platforms: ['PS5', 'Xbox', 'PC']},
  ],
  
  authors: [
    {id: '1', name: 'mario', verified: true},
    {id: '2', name: 'yoshi', verified: false},
    {id: '3', name: 'peach', verified: true},
  ],
  
  reviews: [
    {id: '1', rating: 9, content: 'lorem ipsum', author_id: '1', game_id: '2'},
    {id: '2', rating: 10, content: 'lorem ipsum', author_id: '2', game_id: '1'},
    {id: '3', rating: 7, content: 'lorem ipsum', author_id: '3', game_id: '3'},
    {id: '4', rating: 5, content: 'lorem ipsum', author_id: '2', game_id: '4'},
    {id: '5', rating: 8, content: 'lorem ipsum', author_id: '2', game_id: '5'},
    {id: '6', rating: 7, content: 'lorem ipsum', author_id: '1', game_id: '2'},
    {id: '7', rating: 10, content: 'lorem ipsum', author_id: '3', game_id: '1'},
  ]
}

const typeDefs = `#graphql
  type Game {
    id: ID!
    title: String!
    platforms: [String!]!
    reviews: [Review!]
  }
  type Review {
    id: ID!
    rating: Int!
    content: String!
    author: Author!
    game: Game!
  }
  type Author {
    id: ID!
    name: String!
    verified: Boolean!
    reviews: [Review!]
  }
  type Query {
    games: [Game]
    game(id: ID!): Game
    reviews: [Review]
    review(id: ID!): Review
    authors: [Author]
    author(id: ID!): Author
  }
  type Mutation {
    addGame(game: AddGameInput!): Game
    deleteGame(id: ID!): [Game]
    updateGame(id: ID!, edits: EditGameInput): Game
  }
  input AddGameInput {
    title: String!,
    platforms: [String!]!
  }
  input EditGameInput {
    title: String,
    platforms: [String!]
  }
`

const resolvers = {
  Query: {
    games() {
      return db.games
    },
    game(_, args) {
      return db.games.find((game) => game.id === args.id)
    },
    authors() {
      return db.authors
    },
    author(_, args) {
      return db.authors.find((author) => author.id === args.id)
    },
    reviews() {
      return db.reviews
    },
    review(_, args) {
      return db.reviews.find((review) => review.id === args.id)
    }
  },
  Game: {
    reviews(parent) {
      return db.reviews.filter((r) => r.game_id === parent.id)
    }
  },
  Review: {
    author(parent) {
      return db.authors.find((a) => a.id === parent.author_id)
    },
    game(parent) {
      return db.games.find((g) => g.id === parent.game_id)
    }
  },
  Author: {
    reviews(parent) {
      return db.reviews.filter((r) => r.author_id === parent.id)
    }
  },
  Mutation: {
    addGame(_, args) {
      let game = {
        ...args.game, 
        id: Math.floor(Math.random() * 10000).toString()
      }
      db.games.push(game)

      return game
    },
    deleteGame(_, args) {
      db.games = db.games.filter((g) => g.id !== args.id)

      return db.games
    },
    updateGame(_, args) {
      db.games = db.games.map((g) => {
        if (g.id === args.id) {
          return {...g, ...args.edits}
        }

        return g
      })

      return db.games.find((g) => g.id === args.id)
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: {
    port: 4000,
  }
});

console.log(`🚀 Server ready at ${url}`);