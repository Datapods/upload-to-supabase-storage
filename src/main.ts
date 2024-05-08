import * as core from '@actions/core'
import {basename} from 'path'
import {createClient} from '@supabase/supabase-js'
import {existsSync, lstatSync, readFileSync, readdir, Dirent} from 'node:fs'
import mime from 'mime'

export async function run(): Promise<void> {
  try {
    const bucket = core.getInput('bucket')
    const subfolder = core.getInput('subfolder')
    const cacheControl = core.getInput('cache_control')
    const upsert = core.getInput('upsert') === 'true'
    const path = core.getInput('path')

    // Determine if the filepath is a file or directory
    const isDirectory = existsSync(path) && lstatSync(path).isDirectory()

    // Initialize an array to store the uploaded files, to return url
    const uploadedFiles = []

    core.debug(`File path is a directory: ${isDirectory}`)

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('No supabase url or anon key is found!')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    if (isDirectory) {
      readdir(
        path,
        {withFileTypes: true, encoding: 'utf8'},
        async (err, files: Dirent[]) => {
          for (const file of files) {
            if (file.isFile()) {
              const fileData = readFileSync(file.name)
              const filepath =
                subfolder === ''
                  ? basename(file.name)
                  : `${subfolder}/${basename(file.name)}`
              const {error} = await supabase.storage
                .from(bucket)
                .upload(filepath, fileData, {
                  contentType:
                    mime.getType(basename(file.name)) ||
                    'application/octet-stream',
                  cacheControl,
                  upsert
                })
              if (error) throw new Error(error.message)

              uploadedFiles.push(filepath)
            }
          }
        }
      )
    } else {
      const fileData = readFileSync(path)
      const filepath =
        subfolder === '' ? basename(path) : `${subfolder}/${basename(path)}`
      const {error} = await supabase.storage
        .from(bucket)
        .upload(filepath, fileData, {
          contentType:
            mime.getType(basename(path)) || 'application/octet-stream',
          cacheControl,
          upsert
        })
      if (error) throw new Error(error.message)

      uploadedFiles.push(filepath)
    }

    // https://cwdxvalbnrttrnaqmozc.supabase.co/storage/v1/object/public/email-templates/data_broker_answer_receipt.html
    // Map over uploaded files to return a list of urls
    const data = uploadedFiles.map(
      file => `${supabaseUrl}/storage/v1/object/public/${bucket}/${file}`
    )

    core.setOutput('result', data)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
