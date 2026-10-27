import { Inngest } from 'inngest'
import prisma from '../prisma.js'

// Create an Inngest client
export const inngest = new Inngest({ id: 'my-app' })

// Sync a newly created Clerk user to the database
const syncUserData = inngest.createFunction(
    {
        id: 'sync-user-from-clerk',
        triggers: [{ event: 'clerk.user.created' }],
    },
    async ({ event }) => {
        const { data } = event
        const email = data.email_addresses?.[0]?.email_address

        // The Prisma schema requires an email and name
        if (!email) {
            throw new Error(`No email address found for Clerk user ${data.id}`)
        }

        const name = [data.first_name, data.last_name]
            .filter(Boolean)
            .join(' ') || email

        await prisma.user.upsert({
            where: { id: data.id },
            create: {
                id: data.id,
                email,
                name,
                image: data.image_url ?? '',
            },
            update: {
                email,
                name,
                image: data.image_url ?? '',
            },
        })
    }
)

// Delete a Clerk user from the database
const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-with-clerk',
        triggers: [{ event: 'clerk.user.deleted' }],
    },
    async ({ event }) => {
        const { data } = event

        if (!data.id) return

        await prisma.user.deleteMany({
            where: { id: data.id },
        })
    }
)

// Update an existing Clerk user
const syncUserUpdate = inngest.createFunction(
    {
        id: 'update-user-with-clerk',
        triggers: [{ event: 'clerk.user.updated' }],
    },
    async ({ event }) => {
        const { data } = event
        const email = data.email_addresses?.[0]?.email_address

        await prisma.user.updateMany({
            where: { id: data.id },
            data: {
                ...(email ? { email } : {}),
                name: [data.first_name, data.last_name]
                    .filter(Boolean)
                    .join(' ') || (email ?? ''),
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
