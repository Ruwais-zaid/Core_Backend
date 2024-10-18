class StoreApiTransform {
    static transform(news){
        return {
            id:store.id,
            title:store.title,
            description:store.content,
            image:getImageUrl(store.image),
            created_at:store.created_at,
            author:{
                id:store?.user.id,
                name:store?.user.name,
                profile:store?.user?.image !==null ? getImageUrl(news?.user?.image):"https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pngwing.com%2Fen%2Fsearch%3Fq%3Duser%2BAvatar&psig=AOvVaw1aucRJQXBmXUWizbDOn60k&ust=1728406118600000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLipsdnc_IgDFQAAAAAdAAAAABAE"
            }
        }
    }
}

export default StoreApiTransform;