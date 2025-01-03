const { ApolloServer, gql } = require('apollo-server');

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
    images: ImageConnection!
  }

  type Mutation {
    likeImage(input: LikeImageInput!): LikeImagePayload
  }
`;

// Sample data
const images = [
  {
    id: "1",
    author: "John Doe",
    createdAt: new Date().toISOString(),
    liked: false,
    likesCount: 10,
    picture: "https://example.com/image1.jpg",
    price: 100,
    title: "Beautiful Sunset",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    author: "Jane Smith",
    createdAt: new Date().toISOString(),
    liked: true,
    likesCount: 25,
    picture: "https://example.com/image2.jpg",
    price: 150,
    title: "Mountain View",
    updatedAt: new Date().toISOString(),
  },
];

// Define the resolvers
const resolvers = {
  Query: {
    images: () => {
      return {
        edges: images.map((image) => ({
          cursor: image.id,
          node: image,
        })),
        nodes: images,
        pageInfo: {
          startCursor: images[0]?.id || null,
          endCursor: images[images.length - 1]?.id || null,
          hasNextPage: false,
          hasPreviousPage: false,
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

// Create the Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});