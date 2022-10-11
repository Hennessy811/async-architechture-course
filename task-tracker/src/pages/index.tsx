import { Task, User } from "@prisma/client";
import {
  Button,
  Card,
  Divider,
  Flex,
  List,
  ListItem,
  Text,
  Title,
} from "@tremor/react";
import axios from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import type { GetServerSideProps, NextPage } from "next";
import { prisma } from "../server/db/client";

import { toast } from "react-toastify";

interface Props {
  user: User;
  tasks: Task[];
}

const Home: NextPage<Props> = ({ user, tasks }) => {
  return (
    <div className="">
      <main className="m-auto mt-12 max-w-5xl px-4">
        <Flex>
          <Title>Dashboard | {user.name ?? user.email}</Title>
          <Button
            text="Logout"
            importance="primary"
            handleClick={() => {
              deleteCookie("token");
              window.location.reload();
            }}
          />
        </Flex>
        <Text>Welcome to PopugCorp task-tracking software.</Text>
        <Text>And remember, the Popug is watching you</Text>

        {/* Main section */}
        <Card marginTop="mt-6">
          <Title>Assigned tasks</Title>
          <Divider />
          <div className="max-h-96 overflow-auto pr-4">
            <List marginTop="mt-0">
              {tasks.map((i) => (
                <ListItem spaceX="space-x-0" key={i.id}>
                  <div className="group w-full">
                    <Flex>
                      <Text>{i.title}</Text>
                      <div className="opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                        <Button
                          text="Mark as done"
                          size="xs"
                          handleClick={async () => {
                            await axios.put(`/api/task?id=${i.id}`, null, {
                              headers: {
                                Authorization: `Bearer ${getCookie("token")}`,
                              },
                            });
                            toast.success("Task marked as done");
                            window.location.reload();
                          }}
                        />
                      </div>
                    </Flex>
                  </div>
                </ListItem>
              ))}
            </List>
          </div>
        </Card>

        {/* KPI section */}
        {/* <ColGrid numColsMd={2} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
          <Card>
            <div className="h-28" />
          </Card>
          <Card>
            <div className="h-28" />
          </Card>
        </ColGrid> */}
      </main>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieToken = getCookie("token", { req: ctx.req, res: ctx.res });
  const queryToken = ctx.query.token;

  if (!cookieToken && !queryToken) {
    return {
      redirect: {
        destination:
          "http://localhost:3000/sign-in/?redirectUrl=http://localhost:3001",
        permanent: false,
      },
    };
  }

  if (queryToken) {
    setCookie("token", queryToken, { req: ctx.req, res: ctx.res });
  }

  const user = await axios.get("http://localhost:3000/api/user", {
    headers: {
      Authorization: `Bearer ${cookieToken}`,
    },
  });

  if (user.status !== 200) {
    console.log("user not found or token expired", user.data);

    return {
      redirect: {
        destination:
          "http://localhost:3000/sign-in?redirectUrl=http://localhost:3001",
        permanent: false,
      },
    };
  }

  const tasks = await prisma.task.findMany({
    where: { AND: [{ completed: false }, { userId: user.data.id }] },
  });

  return {
    props: {
      user: user.data,
      tasks,
    },
  };
};
