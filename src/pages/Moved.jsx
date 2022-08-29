function Moved() {
    return (
        <div className="h-screen w-screen flex justify-center items-center">
            <div className="h-1/2 w-5/12">
                <p className="text-3xl font-bold">Announcement 📢</p>
                <p className="text-xl my-5">
                    I'm super excited to share that I've released a new & improved
                    version of Fitbit Recipe Importer! You can learn more about it{' '}
                    <a 
                        className="text-cyan-500 hover:text-cyan-600"
                        href="https://www.reddit.com/r/fitbit/comments/wv6hwt/logit_fitbit_recipe_importer_v2/" 
                        target={'_blank'}>here</a>.
                </p>
                <a
                    target={'_self'}
                    href="https://logit-xyz.netlify.app"
                    className="inline-block hover:cursor-pointer p-3 w-2/5 text-center font-semibold rounded-md bg-cyan-500 hover:bg-cyan-600 hover:text-white/70 text-white">
                        Take me there
                </a>
            </div>
        </div>
    )
}

export default Moved