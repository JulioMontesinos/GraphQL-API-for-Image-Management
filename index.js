import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';
import cors from 'cors';
import images from './data/images.js'; // Importar los datos

// Define the schema
const typeDefs = gql`
  scalar ISO8601DateTime

  type Image {
    id: ID!
    author: String
    createdAt: ISO8601DateTime
    liked: Boolean
    likesCount: Int
    picture: String
    price: Int
    title: String
    updatedAt: ISO8601DateTime
  }

  type PageInfo {
    startCursor: String
    endCursor: String
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type ImageEdge {
    cursor: String!
    node: Image
  }

  type ImageConnection {
    edges: [ImageEdge]
    nodes: [Image]
    pageInfo: PageInfo!
  }

  input LikeImageInput {
    clientMutationId: String
    imageId: ID!
  }

  type LikeImagePayload {
    clientMutationId: String
    image: Image!
  }

  type Query {
    images(first: Int, after: String, title: String): ImageConnection!
  }

  type Mutation {
    likeImage(input: LikeImageInput!): LikeImagePayload
  }
`;

// Define the resolvers
const resolvers = {
  Query: {
    images: (_, { first, after, title }) => {
      let filteredImages = images;

      // Filtrar por título si se proporciona
      if (title) {
        filteredImages = filteredImages.filter((image) =>
          image.title.toLowerCase().includes(title.toLowerCase())
        );
      }

      // Implementar paginación
      const startIndex = after ? filteredImages.findIndex((img) => img.id === after) + 1 : 0;
      const paginatedImages = filteredImages.slice(startIndex, startIndex + (first || filteredImages.length));

      return {
        edges: paginatedImages.map((image) => ({
          cursor: image.id,
          node: image,
        })),
        nodes: paginatedImages,
        pageInfo: {
          startCursor: paginatedImages[0]?.id || null,
          endCursor: paginatedImages[paginatedImages.length - 1]?.id || null,
          hasNextPage: startIndex + (first || 0) < filteredImages.length,
          hasPreviousPage: startIndex > 0,
        },
      };
    },
  },
  Mutation: {
    likeImage: (_, { input }) => {
      const image = images.find((img) => img.id === input.imageId);
      if (!image) throw new Error("Image not found");

      image.liked = !image.liked;
      image.likesCount += image.liked ? 1 : -1;

      return {
        clientMutationId: input.clientMutationId,
        image,
      };
    },
  },
};

// Start the Apollo Server with Express
const startServer = async () => {
  const app = express();

  // Enable CORS
  app.use(cors({ origin: '*' }));

  // Define a route for the root ("/")
  app.get('/', (req, res) => {
    res.send('Welcome to the GraphQL API. Go to /graphql to interact with the API.');
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true
  });

  await server.start();
  server.applyMiddleware({ app });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
};

startServer();