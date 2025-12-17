-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: hoppy_way_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'admin','admin@hoppyway.com','$2b$12$1wyd.5dPoxBRbkZDiW5WvOsM3BxJ6TwktgRJQU3hqdnT93SCesE7S','2025-12-17 00:33:22');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `chat`
--

LOCK TABLES `chat` WRITE;
/*!40000 ALTER TABLE `chat` DISABLE KEYS */;
INSERT INTO `chat` VALUES (1,14,1,'Hello','2025-12-17 13:42:34'),(2,14,1,'hallo broski','2025-12-17 13:46:30'),(3,13,14,'hey','2025-12-17 16:42:36'),(4,14,13,'hello','2025-12-17 16:43:01'),(5,15,14,'Hello po','2025-12-17 16:46:13'),(6,14,15,'zhaider utot','2025-12-17 16:49:10');
/*!40000 ALTER TABLE `chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `content`
--

LOCK TABLES `content` WRITE;
/*!40000 ALTER TABLE `content` DISABLE KEYS */;
INSERT INTO `content` VALUES (1,'Test Title','resource','Article','This is a test article.','https://github.com/','2025-12-17 02:07:25',NULL,NULL,'2025-12-17 10:07:25'),(2,'Happy Test Title','emotion','Video','Happy Test Description HEHEHEHEHEHEHEHEHE','https://youtu.be/_1OfB3DGwpA?si=Oj0UxcP8urq4nTCx','2025-12-17 02:13:10','happy',NULL,'2025-12-17 10:13:10'),(3,'Okay Test Title','emotion','Tips','It’s completely valid to feel okay and still need comfort, reassurance, or understanding. Being “okay” doesn’t mean everything is perfectly resolved or that you don’t deserve care. Sometimes, feeling okay is simply a pause between heavier emotions, and that space can feel unfamiliar or even unsettling. Acknowledging this state without judgment is a healthy step toward emotional balance. You are allowed to accept support even when nothing feels obviously wrong.\n\nComfort doesn’t always exist to fix a problem; often, it exists to affirm your experience. Feeling okay can come with quiet doubts, lingering stress, or unspoken thoughts that still deserve attention. A professional perspective recognizes that emotional states are not extremes but continuums. Sitting with your feelings, even neutral ones, helps build self-awareness and resilience. You don’t need a crisis to justify being cared for.\n\nIt’s important to remember that emotional wellness includes moments of calm and stability. These moments can feel strange if you are used to managing pressure, expectations, or responsibility. Allowing yourself to rest in “okay” without searching for what might be wrong is an act of self-kindness. Comfort in this space means reassurance that nothing is required of you right now. You are doing enough simply by being present.\n\nYou may also find that feeling okay brings clarity rather than excitement or relief. That clarity can gently remind you that you are capable, grounded, and still moving forward. Professionals understand that this state often signals emotional regulation, not emotional absence. It shows that your mind and body are finding balance. That is something worth recognizing and respecting.\n\nIf you ever feel unsure about feeling okay, know that you are not alone in that experience. Many people struggle with accepting calm because it feels unfamiliar or undeserved. You are allowed to feel steady without questioning it or preparing for something to go wrong. Comfort, in this case, means reassurance that peace does not need permission. You are safe to exist exactly as you are in this moment.','','2025-12-17 02:16:35','okay',NULL,'2025-12-17 10:16:35'),(4,'Neutral Test Title','emotion','Article','Feeling neutral is a valid emotional state, even if it feels difficult to define or explain. It doesn’t mean you are disconnected, unmotivated, or lacking depth. Neutrality often reflects emotional steadiness, where nothing is overwhelming or demanding your reaction. Professionals recognize this as a sign of balance rather than emptiness. You are allowed to exist in this space without pressure to feel more.\n\nNeutral feelings can offer a quiet opportunity to observe yourself without intensity. In this state, your mind may be processing, resting, or simply maintaining equilibrium. There is no obligation to turn neutrality into happiness or concern. Comfort here comes from reassurance that nothing is missing or wrong. This emotional pause can be both healthy and restorative.\n\nSometimes neutrality appears after periods of stress, growth, or emotional effort. Your system may be recalibrating, allowing things to settle naturally. That process does not need to be rushed or analyzed excessively. A professional approach emphasizes patience and self-acceptance in these moments. You are not falling behind by feeling neutral.\n\nIt’s also normal to worry that neutral means numb, but the two are not the same. Neutrality still allows awareness, choice, and connection, even if they feel quieter. You are still present and capable, even without strong emotional signals. Comfort means knowing you don’t have to perform emotions to prove your wellbeing. Your experience is enough as it is.\n\nIf neutrality feels unfamiliar, it’s okay to gently sit with it rather than resist it. This state can serve as a foundation for whatever comes next, without forcing direction. You are allowed to take up space emotionally, even in stillness. Professionals understand that neutrality is part of a full emotional range. You are supported, steady, and completely valid in this moment.','https://classroom.google.com/u/3/c/Nzc5ODcxNzk4MjA5','2025-12-17 02:18:09','neutral',NULL,'2025-12-17 10:18:09'),(5,'Sad Test Title','emotion','Video','Feeling sad is a deeply human experience, and it deserves care rather than dismissal. Sadness does not mean weakness, failure, or lack of progress. It often reflects that something meaningful matters to you, even if you cannot fully name it yet. A professional perspective recognizes sadness as a signal, not a flaw. You are allowed to acknowledge it without needing to justify it.\n\nWhen sadness is present, it can feel heavy, quiet, or persistent in ways that are hard to explain. You may still function, think clearly, or meet responsibilities while carrying this weight inside. That does not make your sadness any less real or important. Comfort begins with allowing yourself to feel what you feel without self-criticism. You do not need to rush yourself into feeling better.\n\nSadness can arise from loss, disappointment, exhaustion, or even prolonged stress. Sometimes it comes without a clear cause, which can make it feel more confusing or isolating. From a professional standpoint, both situations are valid and common. Your mind and body may be asking for rest, reflection, or compassion. Listening gently is more helpful than forcing answers.\n\nIt’s important to remember that sadness does not define who you are or where you are headed. Emotions move, even when they linger longer than expected. Feeling sad does not erase your strengths, achievements, or capacity for joy. Comfort means being reminded that this moment is part of a larger emotional landscape. You are still whole, even while hurting.\n\nYou do not have to face sadness alone or in silence. Reaching out, resting, or simply allowing yourself to slow down are all appropriate responses. Professionals understand that healing often begins with being understood, not fixed. You are worthy of patience, care, and gentleness during this time. Even in sadness, you are supported and not alone.','https://youtu.be/hBzP8MtJf04?si=BBQhE_oZ2gOQHa1U','2025-12-17 02:19:23','sad',NULL,'2025-12-17 10:19:23'),(6,'Devastated','emotion','Tips','Feeling devastated can be overwhelming, as though everything has collapsed at once and there is no solid ground to stand on. This level of emotional pain is intense, real, and deserving of deep compassion. It does not mean you are broken or incapable; it means you have been affected by something significant. Professionals understand devastation as a natural response to profound loss, shock, or emotional injury. What you are feeling makes sense, even if it feels unbearable right now.\n\nWhen devastation sets in, it can affect your thoughts, body, and sense of direction all at once. You may feel exhausted, disoriented, or unable to imagine what comes next. These reactions are not signs of failure but indicators that your system is under heavy strain. Comfort at this stage focuses on safety, grounding, and reassurance rather than solutions. You are not expected to have clarity or strength in this moment.\n\nIt is important to know that devastation narrows perspective, making pain feel permanent and all-consuming. From a professional standpoint, this does not mean the pain will always feel this way. Emotional states, even the most intense ones, can and do change over time. Right now, your only responsibility is to get through the moment you are in. Small acts of care count more than big steps.\n\nYou may feel isolated in your devastation, as though no one could truly understand what you are experiencing. While your pain is uniquely yours, you are not alone in having pain this deep. Many people have stood where you are standing and later found steadiness again, even if it felt impossible at the time. Comfort means being reminded that help, connection, and relief exist beyond this moment. You do not have to carry everything by yourself.\n\nHealing from devastation does not follow a straight line, and it does not have a deadline. Some days may feel slightly lighter, while others may feel just as heavy again. This does not mean you are going backward; it means you are human and processing something significant. Professionals emphasize patience, gentleness, and support during times like this. Even now, in the depth of devastation, you are worthy of care, understanding, and hope.\n\nChatGPT can make mistakes. Check important info.','','2025-12-17 02:22:18','very_sad',NULL,'2025-12-17 10:22:18'),(7,'ffefe','emotion','fefefe','fefefeeeee','','2025-12-17 02:42:07','happy',NULL,'2025-12-17 10:42:07'),(8,'Sgeeesg','resource','Video','THOS_DIJO SCHECEFGCEF CSFCTBSCGS CTFCECV ECFTUEFE VYEVJ Vhvdc hdcb eyfcgec cywrcfg sachu vyrkbv dfiv n-dvuklfneutfeh checyde xbovc.THOS_DIJO SCHECEFGCEF CSFCTBSCGS CTFCECV ECFTUEFE VYEVJ Vhvdc hdcb eyfcgec cywrcfg sachu vyrkbv dfiv n-dvuklfneutfeh checyde xbovc.THOS_DIJO SCHECEFGCEF CSFCTBSCGS CTFCECV ECFTUEFE VYEVJ Vhvdc hdcb eyfcgec cywrcfg sachu vyrkbv dfiv n-dvuklfneutfeh checyde xbovc.THOS_DIJO SCHECEFGCEF CSFCTBSCGS CTFCECV ECFTUEFE VYEVJ Vhvdc hdcb eyfcgec cywrcfg sachu vyrkbv dfiv n-dvuklfneutfeh checyde xbovc.THOS_DIJO SCHECEFGCEF CSFCTBSCGS CTFCECV ECFTUEFE VYEVJ Vhvdc hdcb eyfcgec cywrcfg sachu vyrkbv dfiv n-dvuklfneutfeh checyde xbovc.THOS_DIJO SCHECEFGCEF CSFCTBSCGS CTFCECV ECFTUEFE VYEVJ Vhvdc hdcb eyfcgec cywrcfg sachu vyrkbv dfiv n-dvuklfneutfeh checyde xbovc.','https://youtu.be/hBzP8MtJf04?si=_gVl8PJbkNUnmN8Y','2025-12-17 03:59:43',NULL,NULL,'2025-12-17 11:59:43'),(9,'Im a sigma','resource','Video','Boom tarat tarat','https://youtu.be/dQw4w9WgXcQ?si=N6FPKMKo9zulfl4N','2025-12-17 15:58:07',NULL,NULL,'2025-12-17 23:58:07');
/*!40000 ALTER TABLE `content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `journal`
--

LOCK TABLES `journal` WRITE;
/*!40000 ALTER TABLE `journal` DISABLE KEYS */;
INSERT INTO `journal` VALUES (3,14,'Hello ','I am mind','2025-12-18 01:38:23');
/*!40000 ALTER TABLE `journal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `mood_log`
--

LOCK TABLES `mood_log` WRITE;
/*!40000 ALTER TABLE `mood_log` DISABLE KEYS */;
INSERT INTO `mood_log` VALUES (1,1,1,NULL,NULL,'2025-12-11 07:20:04'),(2,4,4,2,'3','2025-12-17 02:22:55'),(3,6,4,5,'Very devastated','2025-12-17 02:35:03'),(4,5,1,5,'5','2025-12-17 02:43:09'),(5,7,1,5,'4','2025-12-17 02:56:30'),(6,4,1,3,'4','2025-12-17 03:02:33'),(7,4,1,3,'d','2025-12-17 03:34:47'),(8,8,4,5,'Sad','2025-12-17 03:50:00'),(9,6,3,2,'3','2025-12-17 05:27:50'),(10,9,1,22,'sfdadsa','2025-12-17 10:55:31'),(11,9,2,3,'Helyea','2025-12-17 11:19:40'),(12,9,3,3,'Yeah','2025-12-17 11:31:15'),(13,9,1,3,'Nah','2025-12-17 11:53:02'),(14,10,5,4,'123','2025-12-17 12:30:25'),(15,12,3,3,'i hate this','2025-12-17 12:39:54'),(16,14,3,4,'Sad','2025-12-17 12:46:48'),(17,14,5,4,'Ohhh man\nSS\nSS\nSS','2025-12-17 13:01:36'),(18,14,1,3,'Sus','2025-12-17 13:22:53'),(19,14,3,3,'Mehh','2025-12-17 16:00:08'),(20,14,4,3,'Sad','2025-12-17 17:21:52');
/*!40000 ALTER TABLE `mood_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (1,1,'The Great Announcement: This is an announcement.',0,0,'2025-12-17 05:12:32'),(2,2,'The Great Announcement: This is an announcement.',0,0,'2025-12-17 05:12:32'),(3,4,'The Great Announcement: This is an announcement.',1,0,'2025-12-17 05:12:32'),(4,5,'The Great Announcement: This is an announcement.',1,0,'2025-12-17 05:12:32'),(5,6,'The Great Announcement: This is an announcement.',1,0,'2025-12-17 05:12:32'),(6,7,'The Great Announcement: This is an announcement.',0,0,'2025-12-17 05:12:32'),(7,8,'The Great Announcement: This is an announcement.',0,0,'2025-12-17 05:12:32'),(8,1,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(9,2,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(10,4,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(11,5,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(12,6,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(13,7,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(14,8,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(15,9,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(16,10,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(17,11,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(18,12,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(19,13,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16'),(20,14,'? Hello Everyone: Test',1,0,'2025-12-17 17:02:16'),(21,15,'? Hello Everyone: Test',0,0,'2025-12-17 17:02:16');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Daniel','Solo','solo.chmana@gmail.com','$2b$12$wp5bGAIRdzwDV.iC0x2LVue4n2GwBYqXTFnH94MimfNYfFr36EVmS','user',NULL),(2,'dasdda','2222','Endozomariette@gmail.com','$2b$12$WEJHHwRChomhkKL5N.MGZeaxi424f1IKQQm1vYNFBC2GrMn7NRnry','user',NULL),(4,'Zhaider Mendoza','zhaimndz','zhaimndz@gmail.com','$2b$12$H.ehc.um6PlKg6VFCgnE6uNW0YYaPnAF3nu1iYfjAkNv/SMW9qSWG','user','2025-12-17 13:12:52'),(5,'Chris Lee','chris','chris@example.com','$2b$12$6vorkk2fgMWGMHorCyuFGOYyNOvb6frk7bgDOkmjKy3jYCJjr3mMq','user','2025-12-17 13:16:53'),(6,'Cody Rhodes','codyrhodes','codyrhodes@example.com','$2b$12$nCo7zTe/qrmiS0c6sTmlzeckOAkwMGLf2jj3BW.fN8YiCRU2EIGZG','user','2025-12-17 13:25:07'),(7,'Roman Reigns','romanreigns','romanreigns@example.com','$2b$12$tEXq5KvR5FVUkisFavhqGuGDwDqk3wTVHN2aMWR6GPaktPBshbmzC','user',NULL),(8,'John Cena','johncena','johncena@example.com','$2b$12$ft95xfmlHztQ2AXHRc6ECeExRRTCMLROGooCsrFoFicLUNSMAEPeq','user',NULL),(9,'Dani','Solo_2414051','d@gmail.com','$2b$12$78zT9xgFaGbkoaFgmRcFnOlg3C/OAqXtGryfX50znI70RmEonGFaa','user','2025-12-17 20:31:50'),(10,'Ses','Blyat','wivoke9923@dlbazi.com','$2b$12$QnDcmwX4RFaNiZ8pNMOv.OGJAGc9ax0WGNRPAfjvbccfY4DOYIY6e','user',NULL),(11,'By','Mikos','sss@gmail.com','$2b$12$TfebzUCTTlBD/uaMQ8zW3OSm6PRuAPrE7gli/5.8.h.GqIZGSdUxe','user',NULL),(12,'Brend','Sesa','22@gmail.com','$2b$12$HjPIhjleG5JocGCA7E1FlenpZkBgOzTY.bWAVYnZNMwHrszfdyyLu','user',NULL),(13,'Bes','Bess','222@gmail.com','$2b$12$0qQw3e8K.ke0in.OV3J0u.cjPdMzwCDt7mOlsf4kD/dYsrxkzMhj.','user','2025-12-18 00:42:20'),(14,'Beb','beb','123@gmail.com','$2b$12$U/hYJTNV1Ksz52qpGdT.oOSF.cOq7y.3s.UNdHz65ifKxpxpgH/xi','user','2025-12-18 02:20:36'),(15,'Testo','Testes','1234@gmail.com','$2b$12$QOr1zg2ctXcOiUu6WWezael6Wt7q/AllnrbtFRjdw731OcM5I9OSO','user',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-18  2:48:54
