import { BirthdayModel } from "../models/Birthday.js";

export async function correctBirthdays(): Promise<void> {
    console.info("Correcting birthdays");

    const result = await BirthdayModel.updateMany(
        {
            date: {
                $lte: new Date(),
            },
        },
        [
            {
                $set: {
                    date: {
                        $dateAdd: {
                            startDate: "$date",
                            unit: "year",
                            amount: 1,
                        },
                    },
                },
            },
        ],
    );

    console.info(`Corrected ${result.modifiedCount} birthday(s)`);
}
