import db from "../../utils/db.ts"
import userService from "../../services/userService.ts"
import { addRandomUser, randomUser } from "../test_helper.ts"
import { initLazy } from "../test_lazy.ts"
import { UserDocument } from "../../types/index.ts"

describe("User service", () => {
    const { lazy, define, clear } = initLazy<{
        user: UserDocument
    }>()

    define("user", addRandomUser)

    beforeAll(async () => await db.connect())
    afterAll(async () => await db.disconnect())
    beforeEach(async () => {
        await db.drop()
        clear()
    })

    describe("#addUser", () => {
        it("should create a user", async () => {
            const user = await lazy.user
            expect(user).toHaveProperty("id")
            expect(user).toHaveProperty("username")
            expect(user).toHaveProperty("email")
        })

        it("should hash the password", async () => {
            const user = await lazy.user
            const found = await userService.findById(user.id)
            expect(found?.password).not.toEqual(randomUser().password)
        })
    })

    describe("#updateUser", () => {
        it("should update the username", async () => {
            const user = await lazy.user
            const updated = await userService.updateUser({
                id: user.id,
                username: "newusername"
            })
            expect(updated?.username).toEqual("newusername")
        })
        it("should update the image if it's a string", async () => {
            const user = await lazy.user
            const updated = await userService.updateUser({
                id: user.id,
                image: "https://someimage.png"
            })
            expect(updated?.image).toEqual("https://someimage.png")
        })
        it("should not update the image if it's undefined", async () => {
            const user = await lazy.user
            const updated = await userService.updateUser({
                id: user.id,
                image: undefined
            })
            expect(updated?.image).toEqual(null)
        })
        it("should delete the image if it's null", async () => {
            const user = await lazy.user
            const updated = await userService.updateUser({
                id: user.id,
                image: null
            })
            expect(updated?.image).toEqual(null)
        })
    })
})