import type { NextApiRequest, NextApiResponse } from 'next';
import { twitterAuthClient, twitterClient } from '@/src/lib/twitterClient';
import { Prisma, PrismaClient, UserQuestTask } from '@prisma/client';
import Client from 'twitter-api-sdk';
type Response = {};

async function prismaInsertUserTwitterData(
  prismaDB: PrismaClient,
  userId: string,
  twitterIdstr: string,
  twitterName: string,
  twitterAccessToken: string,
  twitterExpiresAt: string
) {
  try {
    await prismaDB.userTwitterData.create({
      data: {
        userId,
        twitterIdstr,
        twitterName,
        twitterAccessToken,
        twitterExpiresAt,
      },
    });
    return { error: false, status: 200, message: 'OK' };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code == 'P2002') {
        return {
          error: true,
          status: 409,
          message: 'This Twitter account has been bound by another address',
        };
      }
    }
    return { error: true, status: 503, message: 'Internal Server Error' };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const prismaDB = new PrismaClient();
  await prismaDB.$connect();

  try {
    const { wallet, accessToken } = req.body;
    const twitterClient = new Client(accessToken.accessToken);

    const getUser = await prismaDB.user.findUnique({
      where: {
        wallet: wallet as string,
      },
      include: {
        userTwitterData: true,
        userQuestTask: true,
      },
    });

    if (!getUser) {
      return res.status(404).json({ data: { message: 'Not Found' } });
    }

    const userTwitterData = getUser.userTwitterData;
    let getCurrentUserData;
    if (userTwitterData) {
      if (accessToken.accessToken !== '') {
        await prismaDB.userTwitterData.update({
          where: {
            userId: getUser.id,
          },
          data: {
            twitterAccessToken: accessToken.accessToken,
            twitterExpiresAt: accessToken.expiresAt,
          },
          select: {
            twitterName: true,
          },
        });
      }
    } else {
      if (accessToken.accessToken !== '') {
        getCurrentUserData = await twitterClient.users.findMyUser();
        const insertUserTwitterDataResult = await prismaInsertUserTwitterData(
          prismaDB,
          getUser?.id as string,
          getCurrentUserData.data?.id as string,
          getCurrentUserData.data?.name as string,
          accessToken.accessToken as string,
          accessToken.expiresAt as string
        );

        if (insertUserTwitterDataResult.error) {
          return res
            .status(insertUserTwitterDataResult.status)
            .json({ data: { message: insertUserTwitterDataResult.message } });
        }
      } else {
        return res.status(404).json({ data: { message: 'Not Found' } });
      }
    }

    const getQuestTask = await prismaDB.questTask.findUnique({
      where: {
        taskName: 'twitter_connect',
      },
    });

    if (!getQuestTask) {
      return res
        .status(503)
        .json({ data: { message: 'Internal Server Error' } });
    }

    const userHasTask = getUser.userQuestTask.filter(
      (usertask) => usertask.taskId == getQuestTask.id
    );
    if (!userHasTask.length) {
      await prismaDB.userQuestTask.create({
        data: {
          userId: getUser.id,
          taskId: getQuestTask.id,
        },
      });
    }
    return res.status(200).json({
      data: {
        twitterName: !userTwitterData?.twitterName
          ? getCurrentUserData?.data?.name
          : userTwitterData?.twitterName,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({ data: { message: 'Internal Server Error' } });
  }
}
