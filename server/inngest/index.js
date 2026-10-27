
import { Inngest } from 'inngest'
import prisma from '../prisma.js'

// Create a client to send and receive events
export const inngest = new Inngest({ id: 'my-app' })

// Inngest function to save user data to the database
const syncUserData = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk.user.created' },
    async ({ event }) => {
        const { data } = event

        const email = data.email_addresses?.[0]?.email_address

        await prisma.user.create({
            data: {
                id: data.id,
                email,
                name: [data.first_name, data.last_name]
                    .filter(Boolean)
                    .join(' '),
                image: data.image_url ?? '',
            },
        })
    }
)

// Inngest function to delete user data from the database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-with-clerk' },
    { event: 'clerk.user.deleted' },
    async ({ event }) => {
        const { data } = event

        if (!data.id) return

        await prisma.user.deleteMany({
            where: {
                id: data.id,
            },
        })
    }
)

// Inngest function to update user data in the database
const syncUserUpdate = inngest.createFunction(
    { id: 'update-user-with-clerk' },
    { event: 'clerk.user.updated' },
    async ({ event }) => {
        const { data } = event

        const email = data.email_addresses?.[0]?.email_address

        await prisma.user.updateMany({
            where: {
                id: data.id,
            },
            data: {
                ...(email ? { email } : {}),
                name: [data.first_name, data.last_name]
                    .filter(Boolean)
                    .join(' '),
                image: data.image_url ?? '',
            },
        })
    }
)

// Export all Inngest functions
export const functions = [
    syncUserData,
    syncUserDeletion,
    syncUserUpdate,
]
