import React from "react";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
}

interface CodeRepo {
  id: string;
  name: string;
}

interface Review {
  id: string;
  content: string;
  userId: string;
  user: User;
  repoId: string;
  repo: CodeRepo;
  rating: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  parentId?: string;
  replies: Review[];
}

const reviews: Review[] = [
  {
    id: "1",
    content:
      "Wow, this is an amazing product! I love the design and the quality is top-notch. Definitely worth the price.",
    userId: "1",
    user: { id: "1", name: "Olivia Davis" },
    repoId: "1",
    repo: { id: "1", name: "SomeRepo" },
    rating: 5,
    createdAt: "2024-05-26T00:00:00.000Z",
    updatedAt: "2024-05-26T00:00:00.000Z",
    replies: [
      {
        id: "2",
        content:
          "I agree, the quality is amazing. I've been using this product for a few weeks now and it's been a game-changer.",
        userId: "2",
        user: { id: "2", name: "John Doe" },
        repoId: "1",
        repo: { id: "1", name: "SomeRepo" },
        rating: 4,
        createdAt: "2024-05-25T00:00:00.000Z",
        updatedAt: "2024-05-25T00:00:00.000Z",
        replies: [],
        parentId: "1",
      },
      {
        id: "3",
        content:
          "I'm so glad I found this product. It's been a lifesaver for me. Highly recommend it to everyone!",
        userId: "3",
        user: { id: "3", name: "Emily Smith" },
        repoId: "1",
        repo: { id: "1", name: "SomeRepo" },
        rating: 5,
        createdAt: "2024-05-24T00:00:00.000Z",
        updatedAt: "2024-05-24T00:00:00.000Z",
        replies: [],
        parentId: "1",
      },
    ],
  },
  {
    id: "4",
    content:
      "I've been using this product for a while now and it's been fantastic. The customer service is also top-notch.",
    userId: "4",
    user: { id: "4", name: "Alex Lee" },
    repoId: "1",
    repo: { id: "1", name: "SomeRepo" },
    rating: 5,
    createdAt: "2024-05-20T00:00:00.000Z",
    updatedAt: "2024-05-20T00:00:00.000Z",
    replies: [],
  },
];

const Comment: React.FC<Review> = ({
  id,
  content,
  user,
  createdAt,
  replies,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 border">
          <AvatarImage
            alt={`@${user.name.toLowerCase().replace(" ", "")}`}
            src="/placeholder-user.jpg"
          />
          <AvatarFallback>
            {user.name
              .split(" ")
              .map((name) => name[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <div className="font-medium">{user.name}</div>
            <div className="text-gray-500 text-sm dark:text-gray-400">
              {new Date(createdAt).toDateString()}
            </div>
          </div>
          <div>{content}</div>
        </div>
      </div>
      {replies.length > 0 && (
        <div className="ml-14 space-y-4">
          {replies.map((reply) => (
            <Comment key={reply.id} {...reply} />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      {reviews.map((review) => (
        <Comment key={review.id} {...review} />
      ))}
      <div className="space-y-2">
        <Textarea
          className="min-h-[100px] rounded-md border border-gray-200 p-4 shadow-sm transition-colors focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:focus:border-gray-500 dark:focus:ring-gray-500"
          placeholder="Write your comment..."
        />
        <Button>Submit</Button>
      </div>
    </div>
  );
};

export default CommentSection;
