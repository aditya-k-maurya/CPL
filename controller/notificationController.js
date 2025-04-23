import { getNotificationsDb , markReadNotificationByIdDb, markReadNotificationDb} from "../db/notificationDb.js";

const getNotifications = async function(req, res){
    const username = req.params.username;
    try {
        let response = await getNotificationsDb(username);
        response = response?.rows;
        res.status(200).json(response);
    } catch (error) {
        console.log("Error in fetching notification", error);
        res.status(500).json({message: "Failed to fetch notification"})
    }
}

const markReadNotification = async function(req, res){
    const data = req.body
    try {
        await markReadNotificationDb(data.username);
        res.status(200).json({message: "Notification updated successfully"});
    } catch (error) {
        console.log("Error in updating notification", error);
        res.status(500).json({message: "Error in updating notification."})
    }
}

const markReadNotificationById = async function(req, res){
    const data = req.body;
    try {
        await markReadNotificationByIdDb(data.id);
        res.status(200).json({message: "Notification updated successfully"});
    } catch (error) {
        console.log("Error in updating notification", error);
        res.status(500).json({message: "Error in updating notification."})
    }
}

export {
    getNotifications,
    markReadNotification,
    markReadNotificationById
}